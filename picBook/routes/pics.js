const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Story = mongoose.model('stories');
const User = mongoose.model('users');
const {ensureAuthenticated, ensureGuest} = require('../helpers/auth');
const path=require('path'); 
const exphbs = require('express-handlebars');
const multer=require('multer');
const Grid = require('gridfs-stream');
const fs=require('fs');


// Router.use(express.static('public')); 
router.use(express.static(path.join(process.env.PWD, 'public')));

//Uploading pics
const storage=multer.diskStorage({
destination:'./public/uploads/',
filename:function(req,file,cb){
    cb(null,file.fieldname+'-'+Date.now()+path.extname(file.originalname));
}
});


const upload=multer({
    storage: storage,
    fileFilter: function(req,file,cb){
    checkFileType(file,cb);
    }
    
}).single('mypic');
  function checkFileType(file,cb) {
    //Allowed ext
    const filetypes=/jpeg|jpg|png|gif/;
    const extname=filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype=filetypes.test(file.mimetype);
    if (mimetype&& extname) {
        return cb(null,true);
    }
    else {
        cb('Error: Images Only'); 
    }
}

////////////////////////////////////////////////////////

// stories Index
router.get('/', (req, res) => {
  Story.find({status:'public'})
    .populate('user')
    .sort({date:'desc'})
    .then(stories => {
      res.render('stories/index', {
        stories: stories
      });
    });
});

// Show Single Story
router.get('/show/:id', (req, res) => {
  Story.findOne({
    _id: req.params.id
  })
  .populate('user')
  .populate('comments.commentUser')
  .then(story => {
    if(story.status == 'public'){
      res.render('stories/show', {
        story:story
      });
    } else {
      if(req.user){
        if(req.user.id == story.user._id){
          res.render('stories/show', {
            story:story
          });
        } else {
          res.redirect('/pics');
        }
      } else {
        res.redirect('/pics');
      }
    }
  });
});

// List stories from a user
router.get('/user/:userId', (req, res) => {
  Story.find({user: req.params.userId, status: 'public'})
    .populate('user')
    .then(stories => {
      res.render('stories/index', {
        stories:stories
      });
    });
});

// Logged in users stories
router.get('/my', ensureAuthenticated, (req, res) => {
  Story.find({user: req.user.id})
    .populate('user')
    .then(stories => {
      res.render('stories/index', {
        stories:stories
      });
    });
});

// Add Story Form
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('stories/add');
});

// Edit Story Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Story.findOne({
    _id: req.params.id
  })
  .then(story => {
    if(story.user != req.user.id){
      res.redirect('/pics');
    } else {
      res.render('stories/edit', {
        story: story
      });
    }
  });
});

// Process Add Story

router.post('/', (req, res) => {
////////////////////////////////////////////////////////
upload(req,res,(err)=> {
    if(err) {
        res.render('stories/add', {
            msg:err
        });
        
    }
    else {

      

let allowComments;



  if(req.body.allowComments){
    allowComments = true;
  } else {
    allowComments = false;
  }



  const newStory = {
    title: req.body.title,
    body: req.body.body,
    status: req.body.status,
    allowComments:allowComments,
    user: req.user.id,
    
     fieldname: req.file.fieldname,
  originalname:req.file.originalname,
  encoding:req.file.encoding,
  mimetype:req.file.mimetype,
  destination:req.file.destination,
  filename: req.file.filename,
  path:req.file.path,
  size:req.file.size
  }

  // Create Story
  new Story(newStory)
    .save()
    .then(story => {
      res.redirect(`/pics/show/${story.id}`);
    });
  
  
        
        //console.log(req.file.size);
        if(req.file==undefined) {
            res.render('stories/add');
        }
        else {
            res.render('stories/add', {
                file:`uploads/${req.file.filename}`
            })
        }
        
    }
    });



  /////////////////////////////////////////////////
  
});

// Edit Form Process
router.put('/:id', (req, res) => {
  Story.findOne({
    _id: req.params.id
  })
  .then(story => {
    let allowComments;
    
    if(req.body.allowComments){
      allowComments = true;
    } else {
      allowComments = false;
    }

    // New values
    story.title = req.body.title;
    story.body = req.body.body;
    story.status = req.body.status;
    story.allowComments = allowComments;

    story.save()
      .then(story => {
        res.redirect('/dashboard');
      });
  });
});

// Delete Story
router.delete('/:id', (req, res) => {
  Story.remove({_id: req.params.id})
    .then(() => {
      res.redirect('/dashboard');
    });
});

// Add Comment
router.post('/comment/:id', (req, res) => {
  Story.findOne({
    _id: req.params.id
  })
  .then(story => {
    const newComment = {
      commentBody: req.body.commentBody,
      commentUser: req.user.id
    }

    // Add to comments array
    story.comments.unshift(newComment);

    story.save()
      .then(story => {
        res.redirect(`/pics/show/${story.id}`);
      });
  });
});

module.exports = router;