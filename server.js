const auth = require('./middleware/auth');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const User = require('./models/User');
const Scholarship = require('./models/Scholarship');

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect('mongodb+srv://Laxmi:Laxmipraja%402026@cluster0.uqthi3o.mongodb.net/?appName=Cluster0').then(() =>
    console.log('Mongodb connected')).catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('Scholarship API running');
});

const bcrypt = require('bcrypt');
app.post('/register', async (req, res) => {
    try {
        const hashedpassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedpassword
        });
        await user.save();
        res.send("User Registered Successfully");
    } catch (err) {
        res.status(500).send(err.message);
    }
});

const jwt = require('jsonwebtoken');
app.post('/login', async(req,res)=>{

    try{

        const user = await User.findOne({
            email:req.body.email
        });

        if(!user){

            return res.json({
                message:"User not found"
            });

        }

        const isMatch = await bcrypt.compare(
            req.body.password,
            user.password
        );

        if(!isMatch){

            return res.json({
                message:"Invalid password"
            });

        }

        const token = jwt.sign(
            {id:user._id},
            "secretkey"
        );

        res.json({
            message:"Login Successfully",
            token
        });

    }

    catch(err){

        res.status(500).json({
            message:err.message
        });

    }

});

app.get('/profile', auth, (req, res) => {
    res.send("Welcome USer - Protected Data");
});

// Apply the API 
app.post('/apply', auth, async (req, res) => {
    try{
        const data = new Scholarship({
            name : req.body.name,
            email: req.user.email,
            course:req.body.course,
            income:req.body.income
        });

        await data.save();
        res.send("Application Submitted");
    }catch(err){
        res.status(500).send(err.message);
    }
    // try {
    //     const data = new Scholarship(req.body);
    //     await data.save();
    //     res.send("Application Submitted");
    // } catch (err) {
    //     res.status(500).send(err.message);
    // }
});

// Admin view Application
app.get('/application', auth, async (req, res) => {
    try {
        const data = await Scholarship.find();
        res.json(data);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Admin feature (Approve/Reject)
app.put('/update-status/:id', async (req, res) => {
    try {
        await Scholarship.findByIdAndUpdate(req.params.id,
            {
                status: req.body.status
            }
        );

        res.json({
            message: "Status Updated"
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/my-application', auth, async(req,res)=>{

    try{

        const data = await Scholarship.findOne({

            email:req.user.email

        });

        res.json(data);

    }

    catch(err){

        res.status(500).send(err.message);

    }

});
app.listen(5000, () => {
    console.log('server running on port 5000');
});

