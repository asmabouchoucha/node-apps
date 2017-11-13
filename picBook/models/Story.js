const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Shema
const StorySchema = new Schema({
  title:{
    type:String,
    required: false
  },
  body:{
    type: String,
    required: false
  },
  status: {
    type: String,
    default:'public'
  },
  allowComments: {
    type: Boolean,
    default:true
  },
  comments: [{
    commentBody: {
      type: String,
      required: true
    },
    commentDate:{
      type: Date,
      default: Date.now
    },
    commentUser:{
      type: Schema.Types.ObjectId,
      ref:'users'
    }
  }],
  user:{
    type: Schema.Types.ObjectId,
    ref:'users'
  },
  date:{
    type: Date,
    default: Date.now
  },


   // Image File
    fieldname:{
      type:String
    },
     originalname:{
       type:String
     } ,
     encoding:{
        type:String
     },
     encoding: {
         type:String
     },
     mimetype: {
       type:String
     },
     mimetype:{
       type:String
     },
     destination: {
       type:String
     },
     filename: {
       type:String
     },
     path: {
       type:String
     },
     size:{
       type: Number
     } 
  
  
   


});

// Create collection and add schema
mongoose.model('stories', StorySchema, 'stories');