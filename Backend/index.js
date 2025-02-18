require('dotenv').config()
const express=require('express')
const mongoose=require('mongoose')
const User = require('./models/User')
const MedicalCourse = require('./models/MedicalCourse');
const bcrypt=require('bcryptjs')

const cors=require('cors')
const axios=require('axios')
const nodeMailer=require('nodemailer')
const otpGenerator=require('otp-generator')
const cron=require('node-cron')
const admin=require('./firebase')
const router = express.Router();
const app = express()
const port = process.env.PORT || 3000
app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI).then(()=>{
  console.log("mongodb database connected successfully")
})
const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
      user:process.env.EMAIL ,
      pass:process.env.EMAIL_PASSWORD,  // Use App Password for Gmail
  },
});

transporter.verify((error, success) => {
  if (error) {
      console.error("SMTP Connection Error:", error);
  } else {
      console.log("SMTP Connection Successful!");
  }
});
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/signup', async (req, res) => {
  try {
    const { email, fname, lname, dob, mob, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists, try logging in!!" })
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      fname,
      lname,
      dob,
      mobile_no: mob,
      password: hashedPassword,
      otp: null,
      isVerified: false
    });

    await newUser.save();
    res.status(201).json({ 
      msg: "User registered successfully",
      user: {
        
        email: newUser.email,
        fname: newUser.fname,
        lname: newUser.lname,
        dob: newUser.dob ,
        mobile_no: newUser.mobile_no ,
        
      }
    });
  } catch (err) {
    console.error("Error saving data:", err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

app.get('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({
      
      email: user.email,
      fname: user.fname,
      lname: user.lname,
      dob: user.dob ,
      mobile_no: user.mobile_no ,
    });
  } catch (error) {
    res.status(500).json({ msg: "Error fetching user" });
  }
});



app.post('/verify-otp', async (req,res)=>{
  const email=req.body.email;
  const OTP=req.body.otp;
  const user=await User.findOne({email});
  if(!user){
    return res.status(400).json({msg:"no such user"});
  }

  if(user.otp!=OTP){
    console.log("otp invalid");
    return res.status(400).json({msg:"Invalid OTP"});
  }
  else{
    user.otp=null;
  await user.save()
  console.log("verified") ;
  return res.json({msg:"Email verified successfully"});
  
  } 

})
app.post('/login',async (req,res)=>{
    try{
        const email=req.body.email;
        const password=req.body.password;

        const user=await User.findOne({email});
        if(!user){
          return res.status(400).json({msg:"user not found"})
        }

        const isMatch= await bcrypt.compare(password,user.password)
        if(!isMatch){
          return res.status(400).json({ msg: "Incorrect password" }); 
        }

      //  if (user.isVerified) {
      //    return res.status(200).json({ msg: "Login successful!" });
      // }

       const otp = otpGenerator.generate(6, { digits: true, alphabets: false, specialChars: false });
       user.otp=otp;
       await user.save();
      try{
            await transporter.sendMail({
                to:email,
                subject:"Your OTP code",
                text:`Your OTP is ${otp}`,
             })
             return res.status(200).json({ msg: "OTP sent, please verify your email" });
      }catch(err){
        console.error("Error sending OTP email:", err);
        return res.status(500).json({ msg: "Failed to send OTP, please try again." });
      }

      
    }
    catch(err){
      console.error("Login Error:", err);
      return res.status(500).json({ msg: "Internal Server Error" });
  
    }
})

// const sendNotification=async(userId,medicine)=>{
//   try{
//     const user=await User.findById(userId)
//     if(!user || !user.fcmToken){
//        console.log("User not found or fcm token is missing",userId)
//       return;
//     }

//     const message={
//       notification:{
//         title:"Medicine reminder ⏰",
//         body:`Time to take your ${medicine.medicineName} (${medicine.dosage})`
//       },
//       token:user.fcmToken
//     };

//     await admin.messaging().send(message);
//     console.log(`Reminder sent for medicine ${medicine.medicineName}`)

//   }
//   catch(error){
//     console.log("error sending notification",error)
//   }
// }

// cron.schedule("* * * * *",async()=>{
//   console.log("Checking for scheduled medicine remainders....");

//   const now=new Date();
//   const currentHours=now.getHours();
//   const currentMinutes=now.getMinutes();
//   const currentTime=`${currentHours}:${currentMinutes}`;

//   try{
//     const medicines=await Medicine.find();
//     if(!medicines||medicines.length===0){
//       console.log("no medicine found");
//       return;
//     }

//     medicines.forEach(async(medicineEntry)=>{
//       if(!medicineEntry.medicines||!Array.isArray(medicineEntry.medicines)){
//         console.log("invalid medicine structure for user:",medicineEntry.userId);
//         return;
//       }
//     })
//     medicines.forEach(async (medicineEntry)=>{
//       medicineEntry.medicines.forEach(async (medicine)=>{
//         if(medicine.timeSchedule.includes(currentTime)){
//           await sendNotification(medicineEntry.userId,medicine)
//           console.log("medicine reminder sent")
//         }
//       })
//     })
//   }
//   catch(error){
//     console.log("error fetching medicine",error)
//   }
// })
// app.post('/process-prescription', async (req,res)=>{
//   try{
//     const base64Image=req.body.image;
//     const response=axios.post("http://localhost:5000/extract-text",{image:base64Image});
    
//     return res.json({extractedText:(await response).data.text}) 
//    // const extractedMedicines = response.data.medicines;

//     // Save medicines to database
//   //  const medicineDocs = extractedText.map(med => ({
//     //    userId: req.body.userId,
//       //  medicineName: med.name,
//         //dosage: med.dosage,
//         //timeSchedule: med.schedule
//    // }));

//  //   await Medicine.insertMany(medicineDocs);

//     // Send extracted data back to frontend
//   //  res.json({ medicines: extractedMedicines });


  
//   }
//   catch(error){
//     console.error("error calling paddle-ocr api",error)
//     return res.status(500).json({msg:"failed to process prescription"})
//   }

// })

app.get('/medicines/:email',async(req,res)=>{
  try{
    const {email}=req.params;
    const userMedicines=await Medicine.find({email})
    res.status(200).json(userMedicines)
  }
  catch(error){
    res.status(500).json({msg:"error fetching medicines"})
    console.log(error)
  }
})


app.post('/medical-course', async (req, res) => {
    try {
        const {
            email,
            description,
            startDate,
            endDate,
            medications
        } = req.body;

        console.log('Received request body:', req.body);
        
        // Validate required fields with detailed logging
        if (!email || !description || !startDate || !endDate || !medications) {
            console.log('Missing fields:', {
                email: !email,
                description: !description,
                startDate: !startDate,
                endDate: !endDate,
                medications: !medications
            });
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Validate medications array
        if (!Array.isArray(medications) || medications.length === 0) {
            console.log('Invalid medications:', medications);
            return res.status(400).json({
                success: false,
                message: 'At least one medication is required'
            });
        }

        // Log the data being saved
        console.log('Creating medical course with data:', {
            email,
            description,
            startDate,
            endDate,
            medicationsCount: medications.length
        });

        // Create new medical course
        const newCourse = new MedicalCourse({
            email,
            description,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            medications
        });

        // Log the mongoose document before saving
        console.log('Mongoose document before save:', newCourse);

        // Save to database
        const savedCourse = await newCourse.save();
        
        // Log the saved document
        console.log('Successfully saved course:', savedCourse);
        
        res.status(201).json({
            success: true,
            data: savedCourse,
            message: 'Medical course created successfully'
        });
        
    } catch (error) {
        console.error('Detailed error in creating medical course:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                error: Object.values(error.errors).map(err => err.message)
            });
        }

        // Handle MongoDB connection errors
        if (error.name === 'MongoError' || error.name === 'MongooseError') {
            return res.status(500).json({
                success: false,
                message: 'Database error',
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating medical course',
            error: error.message
        });
    }
});

app.get('/medical-courses/:email', async (req, res) => {
    try {
        const { email } = req.params;

        // Check if the email is provided
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Find courses for the user
        const courses = await MedicalCourse.find({ email })
            .sort({ createdAt: -1 });

        if (courses.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No medical courses found for this email'
            });
        }

        res.status(200).json({
            success: true,
            data: courses,
            message: 'Medical courses retrieved successfully'
        });

    } catch (error) {
        console.error('Error fetching medical courses:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching medical courses',
            error: error.message
        });
    }
});



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
    