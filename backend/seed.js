
const mongoose = require('mongoose')
const dotenv   = require('dotenv')
dotenv.config()

const User = require('./models/User')

const seedUsers = [
  { name:'Aanya Sharma',     email:'aanya@example.com',   password:'password123', role:'Frontend Developer',     skills:['React','Figma','Tailwind','JavaScript','CSS'],              github:'https://github.com/aanya',    bio:'Passionate frontend dev who loves pixel-perfect UIs.' },
  { name:'Rohan Mehta',      email:'rohan@example.com',   password:'password123', role:'Backend Developer',      skills:['Node.js','MongoDB','Express','REST APIs','Docker'],          github:'https://github.com/rohan',    bio:'Backend engineer with 3 years experience building scalable APIs.' },
  { name:'Priya Nair',       email:'priya@example.com',   password:'password123', role:'ML / AI Engineer',       skills:['Python','TensorFlow','Scikit-learn','Data Science','NLP'],   github:'https://github.com/priya',    bio:'AI researcher focused on NLP and computer vision.' },
  { name:'Karthik Raj',      email:'karthik@example.com', password:'password123', role:'UI/UX Designer',         skills:['Figma','Adobe XD','Branding','Wireframing','Prototyping'],   github:'https://github.com/karthik',  bio:'Designer who bridges creativity and user empathy.' },
  { name:'Sneha Patel',      email:'sneha@example.com',   password:'password123', role:'Project Manager',        skills:['Agile','Jira','Communication','Scrum','Risk Management'],    github:'https://github.com/sneha',    bio:'PM who keeps teams focused and deadlines met.' },
  { name:'Arjun Verma',      email:'arjun@example.com',   password:'password123', role:'Backend Developer',      skills:['Python','Django','PostgreSQL','REST APIs','Redis'],           github:'https://github.com/arjun',    bio:'Loves building robust backend systems with Python.' },
  { name:'Divya Krishnan',   email:'divya@example.com',   password:'password123', role:'Frontend Developer',     skills:['Vue.js','CSS','JavaScript','TypeScript','Webpack'],          github:'https://github.com/divya',    bio:'Vue enthusiast building interactive web experiences.' },
  { name:'Nikhil Joshi',     email:'nikhil@example.com',  password:'password123', role:'ML / AI Engineer',       skills:['PyTorch','NLP','OpenCV','Machine Learning','Deep Learning'],  github:'https://github.com/nikhil',   bio:'Deep learning researcher working on vision models.' },
  { name:'Meera Iyer',       email:'meera@example.com',   password:'password123', role:'Presenter / Strategist', skills:['Public Speaking','Slides','Research','Marketing','Strategy'],github:'https://github.com/meera',    bio:'Storyteller who turns complex ideas into compelling pitches.' },
  { name:'Vikram Singh',     email:'vikram@example.com',  password:'password123', role:'DevOps Engineer',        skills:['Docker','Kubernetes','AWS','CI/CD','Linux','Terraform'],      github:'https://github.com/vikram',   bio:'DevOps engineer automating everything from commits to production.' },
  { name:'Ananya Reddy',     email:'ananya@example.com',  password:'password123', role:'Full Stack Developer',   skills:['React','Node.js','MongoDB','TypeScript','GraphQL'],          github:'https://github.com/ananya',   bio:'Full-stack dev who owns features end-to-end.' },
  { name:'Suresh Kumar',     email:'suresh@example.com',  password:'password123', role:'Backend Developer',      skills:['Java','Spring Boot','MySQL','Microservices','Kafka'],         github:'https://github.com/suresh',   bio:'Enterprise Java developer with a love for clean architecture.' },
  { name:'Lakshmi Devi',     email:'lakshmi@example.com', password:'password123', role:'UI/UX Designer',         skills:['Figma','Sketch','User Research','Accessibility','CSS'],      github:'https://github.com/lakshmi',  bio:'Accessibility-first designer making products for everyone.' },
  { name:'Rahul Gupta',      email:'rahul@example.com',   password:'password123', role:'ML / AI Engineer',       skills:['Python','XGBoost','Pandas','Feature Engineering','MLflow'],  github:'https://github.com/rahul',    bio:'ML engineer specialising in tabular data and competitions.' },
  { name:'Pooja Menon',      email:'pooja@example.com',   password:'password123', role:'Frontend Developer',     skills:['React','Redux','GraphQL','Storybook','Testing'],             github:'https://github.com/pooja',    bio:'Component-driven developer obsessed with reusable systems.' },
  { name:'Abhishek Das',     email:'abhishek@example.com',password:'password123', role:'DevOps Engineer',        skills:['GCP','Jenkins','Ansible','Monitoring','Bash'],               github:'https://github.com/abhishek', bio:'Cloud-native engineer making deployments boring (in a good way).' },
  { name:'Nandita Roy',      email:'nandita@example.com', password:'password123', role:'Project Manager',        skills:['Notion','Confluence','OKRs','Team Leadership','Budgeting'],  github:'https://github.com/nandita',  bio:'Strategic PM who aligns product vision with execution.' },
  { name:'Gaurav Chawla',    email:'gaurav@example.com',  password:'password123', role:'Full Stack Developer',   skills:['Angular','Express','PostgreSQL','Docker','Jest'],            github:'https://github.com/gaurav',   bio:'Full-stack dev who thrives in fast-paced hackathon environments.' },
  { name:'Sruthi Pillai',    email:'sruthi@example.com',  password:'password123', role:'ML / AI Engineer',       skills:['Python','Hugging Face','Transformers','BERT','LLMs'],        github:'https://github.com/sruthi',   bio:'NLP specialist building LLM-powered products.' },
  { name:'Tanmay Bhatt',     email:'tanmay@example.com',  password:'password123', role:'Presenter / Strategist', skills:['Pitching','Business Strategy','Market Research','Canva','Storytelling'], github:'https://github.com/tanmay', bio:'Business strategist who can sell any idea to any audience.' },
]

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')


    await User.deleteMany({ isSeeded: true })
    console.log('Cleared previous seed data')

    for (const u of seedUsers) {
      const exists = await User.findOne({ email: u.email })
      if (!exists) {
        const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.name)}`
        await User.create({ ...u, avatar, isSeeded: true })
        console.log(`  ✓ Created: ${u.name} (${u.role})`)
      } else {
        console.log(`  — Skipped (exists): ${u.name}`)
      }
    }

    console.log('\nSeeding complete! 🎉')
    process.exit(0)
  } catch (err) {
    console.error('Seed error:', err.message)
    process.exit(1)
  }
}

seed()
