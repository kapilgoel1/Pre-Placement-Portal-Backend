const express = require('express');
const s3 = require('../cloudstorage/aws');
const Resume = require('../models/resume');
const User = require('../models/user');
const PDFDocument = require('pdfkit');
const _ = require('lodash');
const router = new express.Router();
const { isAuthenticated, isFaculty } = require('../middleware/checkauthlevel');

router.post('/generate', isAuthenticated, async (req, res) => {
  const resume = {
    ...req.body,
    owner: req.user._id,
  };

  resume.name = _.toUpper(resume.name);
  resume.address = _.capitalize(resume.address);
  resume.phone = _.capitalize(resume.phone);
  resume.email = _.capitalize(resume.email);
  resume.dob = _.capitalize(resume.dob);
  resume.languagesKnown = _.capitalize(resume.languagesKnown);
  resume.hobbies = _.capitalize(resume.hobbies);
  resume.careerObjective = _.capitalize(resume.careerObjective);
  if (resume.skills)
    resume.skills = resume.skills.map((skill) => _.capitalize(skill));
  if (resume.achievements)
    resume.achievements = resume.achievements.map((achievement) =>
      _.capitalize(achievement)
    );

  try {
    await Resume.findOneAndReplace({ owner: req.user._id }, resume, {
      upsert: true,
    });

    //Creating PDF
    const doc = new PDFDocument();

    doc.font('Times-Roman');
    doc.fontSize(25).font('Times-Bold').text(resume.name, { align: 'center' });
    doc.fontSize(15).text(resume.address, { align: 'center' });
    doc.text(`Contact No: ${resume.phone}`, { align: 'center' });
    doc.text(`Email Id: ${resume.email}`, { align: 'center' });

    doc.fontSize(19).moveDown().text('Career Objective');
    doc
      .fontSize(15)
      .font('Times-Roman')
      .moveDown(0.3)
      .text(resume.careerObjective, 82);
    if (resume.skills) {
      doc.fontSize(19).font('Times-Bold').moveDown().text('Skills', 72);
      doc
        .fontSize(15)
        .font('Times-Roman')
        .moveDown(0.3)
        .list(resume.skills, 82);
    }

    if (resume.education) {
      doc.fontSize(19).font('Times-Bold').moveDown().text('Education', 72);
      doc.fontSize(15).font('Times-Roman').moveDown(0.5);
      resume.education.map((ed) => {
        doc.moveDown(0.5);
        doc.x = 82;
        y = doc.y;
        doc.text(ed.fromYear + ' - ' + ed.toYear);
        var h = doc.heightOfString(ed.qualification, {
          width: 100,
        });
        doc.text(ed.qualification, doc.x + 150, y, {
          width: 100,
        });
        doc.text(ed.institute, doc.x + 150, y, {
          width: 100,
        });
        if (h > 20) doc.moveDown();
      });
    }
    doc.x = 72;
    if (resume.workExperience) {
      doc.fontSize(19).moveDown().font('Times-Bold').text('Work Experience');
      resume.workExperience.map((experience, index) => {
        doc
          .fontSize(15)
          .font('Times-Bold')
          .moveDown(0.3)
          .text(experience.company, 82, doc.y, { continued: true });
        doc.text(`${(experience.city, experience.state)}`, { align: 'right' });
        doc.text(experience.role, { continued: true });
        doc.text(`${experience.fromYear} - ${experience.toYear}`, {
          align: 'right',
        });
        let responsibilities = [];
        for (i = 1; i <= 4; i++)
          if (experience[`responsibility${i}`] !== '')
            responsibilities.push(experience[`responsibility${i}`]);
        if (responsibilities.length !== 0)
          doc
            .font('Times-Roman')
            .moveDown(0.3)
            .fontSize(15)
            .list(responsibilities, doc.x + 20);
        doc.x = 72;
        doc.moveDown(0.5);
      });
    }
    if (resume.achievements) {
      doc.fontSize(19).font('Times-Bold').moveDown().text('Achievements', 72);
      doc
        .fontSize(15)
        .font('Times-Roman')
        .moveDown(0.3)
        .list(resume.achievements, 82);
    }
    if (resume.projects) {
      doc
        .fontSize(19)
        .font('Times-Bold')
        .moveDown()
        .text('Projects Undertaken', 72);
      resume.projects.map((project, i) => {
        doc
          .fontSize(16)
          .font('Times-Bold')
          .moveDown()
          .text(`${i + 1}. ${project.title}`, 82);
        doc
          .fontSize(15)
          .moveDown(0.3)
          .text('Technologies Used: ', 92, doc.y, { continued: true })
          .font('Times-Roman')
          .text(project.technologiesUsed);
        doc
          .fontSize(15)
          .moveDown(0.3)
          .font('Times-Bold')
          .text('Project Description: ', { continued: true })
          .font('Times-Roman')
          .text(project.description);
      });
    }

    doc.x = 72;

    doc.fontSize(19).font('Times-Bold').moveDown().text('Personal Details');
    doc
      .fontSize(15)
      .moveDown(0.3)
      .font('Times-Bold')
      .text('DOB: ', { continued: true })
      .font('Times-Roman')
      .text(resume.dob);
    doc
      .fontSize(15)
      .moveDown(0.3)
      .font('Times-Bold')
      .text('Languages Known: ', { continued: true })
      .font('Times-Roman')
      .text(resume.languagesKnown);
    doc
      .fontSize(15)
      .moveDown(0.3)
      .font('Times-Bold')
      .text('Hobbies: ', { continued: true })
      .font('Times-Roman')
      .text(resume.hobbies);

    var params = {
      Key: `resume/${req.user._id}.pdf`,
      Body: doc,
      Bucket: process.env.BUCKET_NAME,
      ContentType: 'application/pdf',
    };
    doc.end();

    // Uploading files to the bucket
    s3.upload(params, async function (err, data) {
      if (err) {
        throw err;
      }
      console.log(`File uploaded successfully. ${data.Location}`);
      await User.updateOne({ _id: req.user._id }, { hasresume: true });
      res.status(200).send({});
    });
  } catch (e) {
    console.log(e);
    res.status(400).send({
      error: 'Resume Generation Failed! Please provide sufficient information!',
    });
  }
});

router.get('/data', isAuthenticated, async (req, res) => {
  let resume;
  try {
    resume = await Resume.findOne({ owner: req.user._id });
  } catch (e) {
    res.status(200).send({ error: 'failed to fetch' });
  }
  if (resume) res.status(200).send(resume);
  else res.status(200).send({ info: 'no resume' });
});

router.get('/my/download', isAuthenticated, async (req, res) => {
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: `resume/${req.user._id}.pdf`,
  };
  s3.getObject(params, function (err, data) {
    if (err === null) {
      res.attachment(req.user.firstname + '.pdf');
      res.send(data.Body);
    } else {
      res.status(500).send(err);
    }
  });
});
router.get('/my/view', isAuthenticated, async (req, res) => {
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: `resume/${req.user._id}.pdf`,
  };
  s3.getObject(params, function (err, data) {
    if (err === null) {
      // res.attachment(req.user.firstname + '.pdf');
      // res.setContentType('application/pdf');
      res.setHeader('content-type', 'application/pdf');
      res.setHeader(
        'Content-disposition',
        'inline; filename=' + req.user.firstname + '.pdf'
      );
      res.send(data.Body);
    } else {
      res.status(500).send(err);
    }
  });
});

router.get('/view/student', isAuthenticated, async (req, res) => {
  const { userid, name } = req.query;
  if (!name) name = 'resume';
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: `resume/${userid}.pdf`,
  };
  s3.getObject(params, function (err, data) {
    if (err === null) {
      res.setHeader('content-type', 'application/pdf');
      res.setHeader('Content-disposition', 'inline; filename=' + name + '.pdf');
      res.send(data.Body);
    } else {
      res.status(500).send({ error: 'resume not found' });
    }
  });
});

module.exports = router;
