require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('./database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const User = require('./models/User');
const Prescription = require('./models/Prescription');
const HealthRecord = require('./models/HealthRecord');
const Pharmacy = require('./models/Pharmacy');
const PharmacyInventory = require('./models/PharmacyInventory');
const Order = require('./models/Order');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure Multer for file uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

connectDB();

const JWT_SECRET = process.env.JWT_SECRET;

// ---- AUTHENTICATION API ---- //
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role, language } = req.body;
        const hash = await bcrypt.hash(password, 10);
        
        const validRoles = ['Patient', 'Doctor', 'Pharmacy', 'Admin'];
        const finalRole = validRoles.includes(role) ? role : 'Patient';
        
        let patientId = undefined;
        if (finalRole === 'Patient') {
            patientId = 'PAT-' + Math.floor(100000 + Math.random() * 900000);
        }

        const user = await User.create({ name, email, password: hash, role: finalRole, language: language || 'en', patientId });
        
        // Output userId as string for frontend compatibility if needed
        res.status(201).json({ message: 'User registered successfully', userId: user._id.toString(), patientId: user.patientId });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Email already exists or invalid data' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid Password' });
        
        const token = jwt.sign({ id: user._id.toString(), role: user.role, name: user.name, language: user.language, patientId: user.patientId }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user._id.toString(), name: user.name, role: user.role, language: user.language, patientId: user.patientId } });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Authentication Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(401).json({ error: 'Unauthorized missing token' });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
}

// ---- ADMIN USERS API ---- //
app.get('/api/admin/users', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Admin access required' });
    try {
        const users = await User.find({}, 'name email role patientId');
        const formattedUsers = users.map(u => ({ id: u._id.toString(), ...u.toObject() }));
        res.json(formattedUsers);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/admin/users/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Admin access required' });
    try {
        // Prevent deleting oneself
        if (req.params.id === req.user.id) {
            return res.status(400).json({ error: 'You cannot delete your own admin account' });
        }
        
        const result = await User.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ error: 'User not found' });
        
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/admin/users/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Admin access required' });
    try {
        const { role, name, email } = req.body;
        const updateFields = {};
        if (role) updateFields.role = role;
        if (name) updateFields.name = name;
        if (email) updateFields.email = email;

        const user = await User.findByIdAndUpdate(req.params.id, updateFields, { new: true });
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ message: 'User updated successfully', user: { id: user._id.toString(), role: user.role, name: user.name } });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// ---- DOCTOR PATIENTS API ---- //
app.get('/api/patients', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Doctor' && req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Doctor or Admin access required' });
    }
    try {
        const patients = await User.find({ role: 'Patient' }, 'name patientId');
        res.json(patients);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// ---- PRESCRIPTIONS API ---- //
app.post('/api/prescriptions', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Doctor') return res.status(403).json({ error: 'Only Doctors can prescribe' });
    try {
        const { patient_id, medicines, dosage } = req.body;
        if (!patient_id) return res.status(400).json({ error: 'Requires a patient_id' });
        
        // Lookup actual ObjectId using short patientId
        const pUser = await User.findOne({ patientId: patient_id, role: 'Patient' });
        if (!pUser) {
            return res.status(404).json({ error: 'Invalid Patient ID. No patient found with ID: ' + patient_id });
        }

        const p = await Prescription.create({ 
            patient_id: new mongoose.Types.ObjectId(pUser._id), 
            doctor_name: req.user.name, 
            medicines, 
            dosage 
        });
        res.json({ message: 'Prescription added', id: p._id.toString() });
    } catch (err) {
        console.error('Error creating prescription:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

app.get('/api/prescriptions', authenticateToken, async (req, res) => {
    try {
        const query = req.user.role === 'Patient' ? { patient_id: req.user.id } : {};
        const prescriptions = await Prescription.find(query).populate('patient_id', 'patientId name').lean();
        
        const mapped = prescriptions.map(p => ({
            ...p,
            patient_id_short: p.patient_id?.patientId || p.patient_id?.name || 'Unknown',
            patient_id: p.patient_id?._id || p.patient_id
        }));
        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// ---- HEALTH RECORDS API ---- //
app.get('/api/health-records', authenticateToken, async (req, res) => {
    try {
        const query = req.user.role === 'Patient' ? { patient_id: req.user.id } : {};
        const records = await HealthRecord.find(query).populate('patient_id', 'patientId name').lean();
        
        const mapped = records.map(r => ({
            ...r,
            patient_id_short: r.patient_id?.patientId || r.patient_id?.name || 'Unknown',
            patient_id: r.patient_id?._id || r.patient_id
        }));
        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/health-records', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        console.log("Upload request received. Body:", req.body);
        console.log("File:", req.file);

        const { details, patient_id } = req.body;
        const doctor_id = req.user.role === 'Doctor' ? req.user.id : null;
        
        let actualPatientId = req.user.id;
        if (req.user.role === 'Doctor' && patient_id) {
            // Find patient by PAT-ID
            const p = await User.findOne({ patientId: patient_id });
            if (p) {
                actualPatientId = p._id;
            } else {
                return res.status(404).json({ error: 'Patient ID not found' });
            }
        }

        // Validate that actualPatientId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(actualPatientId)) {
            console.error("Invalid Patient ID:", actualPatientId);
            return res.status(400).json({ error: 'Invalid Patient ID format' });
        }

        const h = await HealthRecord.create({
            patient_id: new mongoose.Types.ObjectId(actualPatientId),
            doctor_id: doctor_id ? new mongoose.Types.ObjectId(doctor_id) : null,
            document_path: req.file ? req.file.filename : 'uploaded_file.pdf',
            details: details || 'Health record document uploaded'
        });

        console.log("Health record created successfully:", h._id);
        res.status(201).json(h);
    } catch (err) {
        console.error("Health Record Upload Error:", err);
        res.status(500).json({ 
            error: 'Server error during upload', 
            details: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

app.put('/api/health-records/:id/verify', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Doctor' && req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Only Doctors and Admins can verify records' });
    }
    try {
        const result = await HealthRecord.findByIdAndUpdate(req.params.id, { status: 'Verified' }, { new: true });
        if (!result) return res.status(404).json({ error: 'Record not found' });
        res.json({ message: 'Record verified successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});


// ---- PHARMACY PROFILE API ---- //
app.post('/api/pharmacy/profile', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Pharmacy') return res.status(403).json({ error: 'Pharmacy role required' });
    try {
        const { name, address, latitude, longitude } = req.body;
        if (!name || !address) return res.status(400).json({ error: 'Name and address are required' });
        
        const coords = (latitude && longitude) ? [parseFloat(longitude), parseFloat(latitude)] : [0, 0];
        
        let pharmacy = await Pharmacy.findOne({ owner_id: req.user.id });
        if (pharmacy) {
            pharmacy.name = name;
            pharmacy.address = address;
            pharmacy.location = { type: 'Point', coordinates: coords };
            await pharmacy.save();
        } else {
            pharmacy = await Pharmacy.create({
                owner_id: req.user.id,
                name,
                address,
                location: { type: 'Point', coordinates: coords }
            });
        }
        res.json({ message: 'Pharmacy profile saved', pharmacy });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/pharmacy/profile', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Pharmacy') return res.status(403).json({ error: 'Pharmacy role required' });
    try {
        const pharmacy = await Pharmacy.findOne({ owner_id: req.user.id });
        res.json(pharmacy || {});
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// ---- PHARMACY DB API ---- //
app.get('/api/pharmacy/inventory', authenticateToken, async (req, res) => {
    try {
        if (req.user.role === 'Pharmacy') {
            const inventory = await PharmacyInventory.find({ pharmacy_user_id: req.user.id });
            const output = inventory.map(i => ({ 
                id: i._id.toString(), 
                medicine_name: i.medicine_name, 
                dosage: i.dosage,
                status: i.status,
                price: i.price || 0,
                quantity: i.quantity || 0,
                description: i.description || '',
                category: i.category || 'General'
            }));
            return res.json(output);
        } else {
            // Patient/Doctor Search functionality
            const { lat, lng } = req.query;
            let pharmacies = [];
            
            if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
                pharmacies = await Pharmacy.aggregate([
                    {
                        $geoNear: {
                            near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                            distanceField: "dist_calculated",
                            maxDistance: 100000, // 100km radius max
                            spherical: true
                        }
                    }
                ]);
            } else {
                pharmacies = await Pharmacy.find({}).lean();
            }

            // Make a lookup map for pharmacies
            const pharmMap = {};
            pharmacies.forEach(p => {
                let distObj = 'Unknown location';
                if (p.dist_calculated != null) {
                    distObj = (p.dist_calculated / 1000).toFixed(1) + ' km';
                } else if (p.distance) {
                    distObj = p.distance;
                }
                pharmMap[p.owner_id.toString()] = {
                    name: p.name,
                    address: p.address,
                    distance: distObj,
                    lat: p.location?.coordinates?.[1] || 0,
                    lng: p.location?.coordinates?.[0] || 0
                };
            });

            // Get all inventory, map user details
            const inventories = await PharmacyInventory.find().populate('pharmacy_user_id', 'name');
            const data = inventories.map(inv => {
                const ownerId = inv.pharmacy_user_id._id.toString();
                const pharmacyData = pharmMap[ownerId] || {};
                return {
                    id: inv._id.toString(),
                    medicine_name: inv.medicine_name,
                    dosage: inv.dosage,
                    status: inv.status,
                    price: inv.price || 0,
                    quantity: inv.quantity || 0,
                    description: inv.description || '',
                    category: inv.category || 'General',
                    pharmacy_user_id: ownerId,
                    pharmacy_name: pharmacyData.name || inv.pharmacy_user_id.name,
                    address: pharmacyData.address || 'Address not registered',
                    distance: pharmacyData.distance || 'Unknown'
                };
            });

            // If we have geospatial sort from mongo, sort `data` so the closest ones appear first.
            if (lat && lng) {
                 const orderMap = {};
                 pharmacies.forEach((p, idx) => orderMap[p.owner_id.toString()] = idx);
                 
                 data.sort((a, b) => {
                     const idxA = orderMap[invOwnerId(inventories, a.id)] ?? 999;
                     const idxB = orderMap[invOwnerId(inventories, b.id)] ?? 999;
                     return idxA - idxB;
                 });
            }

            res.json(data);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Public medicines API - no auth needed so all users can browse
app.get('/api/public/medicines', async (req, res) => {
    try {
        const { lat, lng, search } = req.query;
        let pharmacies = [];
        
        if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
            pharmacies = await Pharmacy.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                        distanceField: "dist_calculated",
                        maxDistance: 50000, // 50km radius
                        spherical: true
                    }
                }
            ]);
        } else {
            pharmacies = await Pharmacy.find({}).lean();
        }

        const pharmMap = {};
        pharmacies.forEach(p => {
            let distStr = 'Unknown';
            if (p.dist_calculated != null) {
                distStr = (p.dist_calculated / 1000).toFixed(1) + ' km';
            }
            pharmMap[p.owner_id.toString()] = {
                name: p.name,
                address: p.address,
                distance: distStr,
                lat: p.location?.coordinates?.[1] || 0,
                lng: p.location?.coordinates?.[0] || 0
            };
        });

        let query = {};
        if (search) {
            query.medicine_name = { $regex: search, $options: 'i' };
        }

        const inventories = await PharmacyInventory.find(query).populate('pharmacy_user_id', 'name');
        const data = inventories.map(inv => {
            const ownerId = inv.pharmacy_user_id._id.toString();
            const pd = pharmMap[ownerId] || {};
            return {
                id: inv._id.toString(),
                medicine_name: inv.medicine_name,
                dosage: inv.dosage,
                status: inv.status,
                price: inv.price || 0,
                quantity: inv.quantity || 0,
                description: inv.description || '',
                category: inv.category || 'General',
                pharmacy_user_id: ownerId,
                pharmacy_name: pd.name || inv.pharmacy_user_id.name,
                address: pd.address || 'Not registered',
                distance: pd.distance || 'Unknown'
            };
        });

        // Sort by distance if geo query
        if (lat && lng) {
            const orderMap = {};
            pharmacies.forEach((p, idx) => orderMap[p.owner_id.toString()] = idx);
            data.sort((a, b) => {
                const idxA = orderMap[a.pharmacy_user_id] ?? 999;
                const idxB = orderMap[b.pharmacy_user_id] ?? 999;
                return idxA - idxB;
            });
        }

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Nearby pharmacies list API
app.get('/api/public/pharmacies', async (req, res) => {
    try {
        const { lat, lng } = req.query;
        let pharmacies = [];

        if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
            pharmacies = await Pharmacy.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                        distanceField: "dist_calculated",
                        maxDistance: 50000,
                        spherical: true
                    }
                }
            ]);
        } else {
            pharmacies = await Pharmacy.find({}).lean();
        }

        const result = await Promise.all(pharmacies.map(async (p) => {
            const medicineCount = await PharmacyInventory.countDocuments({ pharmacy_user_id: p.owner_id, status: 'In Stock' });
            return {
                id: p._id.toString(),
                owner_id: p.owner_id.toString(),
                name: p.name,
                address: p.address,
                distance: p.dist_calculated != null ? (p.dist_calculated / 1000).toFixed(1) + ' km' : 'Unknown',
                lat: p.location?.coordinates?.[1] || 0,
                lng: p.location?.coordinates?.[0] || 0,
                medicines_in_stock: medicineCount
            };
        }));

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/pharmacy/inventory', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Pharmacy') return res.status(403).json({ error: 'Allowed only for Pharmacy role' });
    try {
        const { medicine_name, dosage, status, price, quantity, description, category } = req.body;
        const inv = await PharmacyInventory.create({ 
            pharmacy_user_id: req.user.id, 
            medicine_name, 
            dosage, 
            status,
            price: price || 0,
            quantity: quantity || 0,
            description: description || '',
            category: category || 'General'
        });
        res.json({ message: 'Medicine added to inventory', id: inv._id.toString() });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/pharmacy/inventory/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Pharmacy') return res.status(403).json({ error: 'Allowed only for Pharmacy role' });
    try {
        const { status, price, quantity } = req.body;
        const updateFields = {};
        if (status !== undefined) updateFields.status = status;
        if (price !== undefined) updateFields.price = price;
        if (quantity !== undefined) updateFields.quantity = quantity;
        
        const result = await PharmacyInventory.findOneAndUpdate(
            { _id: req.params.id, pharmacy_user_id: req.user.id },
            updateFields,
            { new: true }
        );
        if (!result) return res.status(404).json({ error: 'Item not found or unauthorized' });
        res.json({ message: 'Stock updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/pharmacy/inventory/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Pharmacy') return res.status(403).json({ error: 'Allowed only for Pharmacy role' });
    try {
        const result = await PharmacyInventory.findOneAndDelete({ _id: req.params.id, pharmacy_user_id: req.user.id });
        if (!result) return res.status(404).json({ error: 'Item not found or unauthorized' });
        res.json({ message: 'Medicine removed' });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// ---- ORDERS API ---- //
app.post('/api/orders', authenticateToken, async (req, res) => {
    try {
        const { pharmacy_user_id, items } = req.body;
        if (!items || items.length === 0) return res.status(400).json({ error: 'No items in order' });

        // Look up pharmacy details
        const pharmacy = await Pharmacy.findOne({ owner_id: pharmacy_user_id });
        
        let total = 0;
        const orderItems = [];
        
        for (const item of items) {
            const med = await PharmacyInventory.findById(item.medicine_id);
            if (!med) continue;
            const qty = item.quantity || 1;
            const itemTotal = (med.price || 0) * qty;
            total += itemTotal;
            orderItems.push({
                medicine_id: med._id,
                medicine_name: med.medicine_name,
                dosage: med.dosage,
                quantity: qty,
                price: med.price || 0
            });
        }

        const order = await Order.create({
            user_id: new mongoose.Types.ObjectId(req.user.id),
            pharmacy_id: new mongoose.Types.ObjectId(pharmacy_user_id),
            items: orderItems,
            total_amount: total,
            pharmacy_name: pharmacy?.name || 'Unknown Pharmacy',
            pharmacy_address: pharmacy?.address || 'Unknown Address'
        });

        res.json({ message: 'Order placed successfully', order_id: order._id.toString(), total_amount: total });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to place order' });
    }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'Patient') {
            query.user_id = req.user.id;
        } else if (req.user.role === 'Pharmacy') {
            query.pharmacy_id = req.user.id;
        }
        const orders = await Order.find(query).sort({ order_date: -1 }).lean();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/orders/:id/status', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Pharmacy') return res.status(403).json({ error: 'Only pharmacy can update order status' });
    try {
        const { status } = req.body;
        const result = await Order.findOneAndUpdate(
            { _id: req.params.id, pharmacy_id: req.user.id },
            { status },
            { new: true }
        );
        if (!result) return res.status(404).json({ error: 'Order not found' });
        res.json({ message: 'Order status updated' });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/pharmacy', authenticateToken, async (req, res) => {
    try {
        const authPharmacies = await Pharmacy.find({});
        res.json(authPharmacies);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// ---- STATISTICS API ---- //
app.get('/api/stats/summary', authenticateToken, async (req, res) => {
    try {
        const [users, prescriptions, records, pharmacies] = await Promise.all([
            User.countDocuments(),
            Prescription.countDocuments(),
            HealthRecord.countDocuments(),
            Pharmacy.countDocuments()
        ]);
        res.json({ users, prescriptions, records, pharmacies });
    } catch (err) {
        res.status(500).json({ error: 'Stats error' });
    }
});

app.get('/api/stats/activity', authenticateToken, async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Privacy: Patients see only their own data. All other roles see global activity.
        const isPatient = req.user.role === 'Patient';
        const patientId = isPatient ? new mongoose.Types.ObjectId(req.user.id) : null;

        const prescriptionMatch = isPatient
            ? { patient_id: patientId, date: { $gte: sevenDaysAgo } }
            : { date: { $gte: sevenDaysAgo } };

        const recordMatch = isPatient
            ? { patient_id: patientId, created_at: { $gte: sevenDaysAgo } }
            : { created_at: { $gte: sevenDaysAgo } };

        const [prescriptions, records] = await Promise.all([
            Prescription.aggregate([
                { $match: prescriptionMatch },
                { $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    count: { $sum: 1 }
                }},
                { $sort: { _id: 1 } }
            ]),
            HealthRecord.aggregate([
                { $match: recordMatch },
                { $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
                    count: { $sum: 1 }
                }},
                { $sort: { _id: 1 } }
            ])
        ]);

        res.json({ prescriptions, records });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Activity stats error' });
    }
});

app.get('/api/stats/roles', authenticateToken, async (req, res) => {
    try {
        const roles = await User.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } }
        ]);
        res.json(roles);
    } catch (err) {
        res.status(500).json({ error: 'Role stats error' });
    }
});

// Helper for sorting
function invOwnerId(inven, invId) {
    const f = inven.find(i => i._id.toString() === invId);
    return f ? f.pharmacy_user_id._id.toString() : '';
}

// ---- WEBRTC SIGNALING (SOCKET.IO) ---- //
io.on('connection', (socket) => {
    console.log('User connected to WebRTC sigaling:', socket.id);
    
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        console.log(`User ${userId} joined room ${roomId}`);
        socket.to(roomId).emit('user-connected', userId);
        
        socket.on('offer', (offer, toId) => {
            socket.to(roomId).emit('offer', offer, userId);
        });

        socket.on('answer', (answer, toId) => {
            socket.to(roomId).emit('answer', answer, userId);
        });

        socket.on('ice-candidate', (candidate, toId) => {
            socket.to(roomId).emit('ice-candidate', candidate, userId);
        });

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId);
        });
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ 
        error: 'Internal Server Error', 
        details: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

const PORT = process.env.PORT || 5005;
server.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
