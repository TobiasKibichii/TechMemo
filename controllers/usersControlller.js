const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

const getAllUsers = asyncHandler( async (req,res) =>{
    const users = await User.find().select('-password').lean();
    if(!users?.length){
        return res.status(400).json({message: 'No Users Found'})
    }
    res.json(users);
})
const createNewUser = asyncHandler(async (req,res) =>{
    const {username, password, roles} = req.body;

    if(!username || !password || !Array.isArray(roles) ||!roles.length
    ){
        res.json({message: 'All fields are required'})
    }
    
    const duplicate = await User.findOne({username}).lean().exec();
    if(duplicate){
        res.status(409).json({message: 'Username Already Exists'});
    }

    const hashedPwd = bcrypt.hash(password, 10) //salt rounds

    const userObject = {username, "Password": hashedPwd, roles}

    const user = User.create(userObject);
    if(user){
        res.status(201).json({message: `New user ${username} created`})
    }else{
        res.status(400).json({message: 'Invalid User Data Received'})
    }

})

const updateUser = asyncHandler(async (req,res) =>{
    const {id, username, roles, active, password} = req.body

    //confirm data
    if(!id  || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean' ){
        return res.status(400).json({message: 'All Fields except password are required'})
    }

    const user = await User.findById(id).exec();

    if(!user){
        return res.status(400).json({message: "User Not Found"})
    }

    const duplicate = User.findOne({username}).lean().exec()

    if(duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({message: "Duplicate Username"})
    }

    user.username = username
    user.roles = roles
    user.active = active

    if (password){
        user.password = bcrypt.hash(password, 10) //salt rounds
    }

    const updatedUser = user.save()

    res.json({message: `${updatedUser.username} updated`})
})

const deleteUser = asyncHandler(async (req,res) =>{
    const {id} = req.body

    if(!id){
        return res.status(400).json({message: "User Id Required"})
    }

    const note = await Note.findOne({user: id}).lean().exec()

    if(note){
        return res.status(400).json({message: "User Has Assigned Notes"})
    }

    const user = await User.findById(id).exec()

    if(!user){
        return res.status(400).json({message: 'User Not found'})
    }

    const result = await user.deleteOne()

    const reply = `Username ${result.username} with ID ${result._id} deleted`

    res.json(reply);
})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}