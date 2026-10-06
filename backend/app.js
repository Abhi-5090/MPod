const express = require("express");
const bodyParser = require("body-parser");
const InitiateMongoServer = require("./src/config/db");
const cors = require("cors");
const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');
const axios = require('axios');
const path = require('path');
const cookieParser = require("cookie-parser");
const UserRouter = require('./src/routes/userRoutes');
const TechnologyRouter = require('./src/routes/technologyRoutes');
const TenantRouter = require('./src/routes/tenantRoutes');
const TopicRouter = require('./src/routes/topicRoutes');
const ModuleRouter = require('./src/routes/moduleRoutes');
const CompanyRouter = require('./src/routes/companyRoutes');
const CompanyQuestionRouter = require('./src/routes/companyQuestionRoutes');
const TagRouter = require('./src/routes/tagRoutes');
const CodingQuestionRouter = require('./src/routes/codingQuestionRoutes');

// const CompanyInfoRouter = require('./src/routes/companyInfoRoutes')
const InterviewRouter = require('./src/routes/interviewRoutes');
const LiteInterviewRouter = require('./src/routes/liteInterviewRoutes');

const CompanyInterviewRouter = require('./src/routes/companyInterviewRoutes');
const CodingInterviewRouter = require('./src/routes/codingInterviewRoutes');
const DashboardRouter = require('./src/routes/dashboardRoutes');

// Initiate Mongo Server
InitiateMongoServer();
const app = express();
console.log(path.join(__dirname, 'models'))
// PORT
const PORT = process.env.PORT || 8002;
// const wss = new WebSocket.Server({ port: 7001 });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/backend/profile-pics', express.static('src/uploads/profile-pics'));
app.use('/backend/technology-icons', express.static(path.join(__dirname, 'uploads/technology-icons')));

// app.use('/models', express.static(path.join(__dirname, 'public/models')));
app.use(cors({
  origin: [
    "http://node.technicalhub.io:8000",
    "http://node.technicalhub.io:8003",
    "http://node.technicalhub.io:8001",
    "https://mpod.ai",
    "https://std-bio.web.app",
    "http://localhost:3000"
  ],
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept"
}));
app.use("/backend/models", express.static(path.join(__dirname, "public/models"), {
  setHeaders: (res, path) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
}));
app.use('/backend/', UserRouter);
app.use('/backend/', TechnologyRouter)
app.use('/backend/', TenantRouter);
app.use('/backend/', TopicRouter);
app.use('/backend/', ModuleRouter);
app.use('/backend/', CompanyRouter);
app.use('/backend/', CompanyQuestionRouter);
app.use('/backend/', CodingQuestionRouter);
// app.use('/', CompanyInfoRouter);
app.use('/backend/', InterviewRouter);
app.use('/backend/', LiteInterviewRouter);

app.use('/backend/', CompanyInterviewRouter);
app.use('/backend/', CodingInterviewRouter);
app.use('/backend/', DashboardRouter);

app.use('/backend/', TagRouter);

app.get('/backend', (req, res) => {
  res.json({ message: "API Working" });
});

// const server = https.createServer(
//   {
//     key: fs.readFileSync('/technicalhub.key'),
//     cert: fs.readFileSync('/2029e6c6d0c7e8ae.crt'),
//   },
//   app
// );

app.get('/api/server-time', (req, res) => {
  res.json({ currentTime: new Date().toISOString() });
});

app.listen(PORT, (req, res) => {
  console.log(`Server Started at PORT ${PORT}`);
});

