const postModel = require('../models/postModel');
const userModel = require('../models/userModel');
var mongoose = require('mongoose');
const jwt = require("jsonwebtoken");

const createPost = async (req, res, next) => {
    try {
        const data = req.body
        const { post, authorId } = data;

        if (Object.keys(data).length == 0) return res.status(404).send({ status: false, message: "body require!" })
        if (!post) return res.status(404).send({ status: false, message: "post require!" })
        if (!authorId) return res.status(404).send({ status: false, message: "authorId require!" })
        if (!mongoose.isValidObjectId(authorId)) return res.status(404).send({ status: false, message: `Invalid ${authorId}` });

        let checkAuthor = await userModel.findById(authorId)
        if (!checkAuthor) return res.status(404).send({ status: false, message: "author not found" })

        //authorization
        if (authorId != req.user_Id) return res.status(404).send({ status: false, message: 'You are not the owner!' })

        const savedData = await postModel.create(data)
        res.status(201).send({ status: true, message: savedData })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

const getPostById = async (req, res) => {
    try {
        let postId = req.params.postId

        if (!postId) return res.status(404).send({ status: false, message: "postId require!" })
        if (!mongoose.isValidObjectId(postId)) return res.status(404).send({ status: false, message: "Invalid postId" })

        const savedData = await postModel.findOne({ _id: postId })

        if (!savedData) return res.status(404).send({ status: false, message: 'No Data Found' })
        if (savedData.isDeleted == true) return res.status(404).send({ status: false, message: "Post id deleted!" })

        res.status(200).send({ status: true, message: savedData })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

const getPost = async (req, res) => {
    try {
        let data = {}
        data.isDeleted = false
        
        const userId = req.user_Id

        let checkUser = await userModel.findById(userId)
        if (!checkUser) return res.status(404).send({ status: false, message: "user not found" })

        data.authorId = userId

        let savedData = await postModel.find(data).populate('comments').populate('likes')  

        if (savedData.length == 0) return res.status(404).send({ status: false, message: `Not Found Post` })

        res.status(200).send({ status: true, message: `post list`, data: savedData })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

const updatePostById = async (req, res) => {
    try {
        let id = req.params.postId
        let data = req.body
        let { post } = data

        if (!id) return res.status(404).send({ status: false, message: `postId is required!` })
        if (!mongoose.isValidObjectId(id)) return res.status(404).send({ status: false, message: `Invalid ${id}` })

        if (Object.keys(data).length == 0)
            return res.status(400).send({ status: false, message: "body required!" })
        if (!post) return res.status(400).send({ status: false, message: "post required!" })

        let existPost = await postModel.findOne({ _id: id, isDeleted: false })
        if (!existPost) return res.status(404).send({ status: false, message: `No Post Found or Deleted` })

        // authorization
        // todo req.user_Id global declaration at middleware
        // console.log(existPost.authorId, req.user_Id)
        if (existPost.authorId != req.user_Id) return res.status(404).send({ status: false, message: 'You are not the owner!' })

        let updatedPost = await postModel.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true })
        res.status(200).send({ status: true, message: "success", data: updatedPost })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

const deletePostById = async (req, res) => {
    try {
        let Id = req.params.postId

        if (!Id) return res.status(404).send({ status: false, message: `postId is required!` })
        if (!mongoose.isValidObjectId(Id)) return res.status(404).send({ status: false, message: `Invalid ${Id}` })

        let existPost = await postModel.findOne({ _id: Id, isDeleted: false })
        if (!existPost) return res.status(404).send({ status: false, message: `No Post Found or Deleted` })

        //authorization 
        if (existPost.authorId != req.user_Id) return res.status(404).send({ status: false, message: `Unauthorized User` })

        let saveData = await postModel.findByIdAndUpdate({ _id: Id }, { $set: { isDeleted: true, DeletedAt: new Date() } }, { new: true })

        return res.status(200).send({ status: true, message: "success" });

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

module.exports.createPost = createPost
module.exports.getPostById = getPostById
module.exports.getPost = getPost
module.exports.updatePostById = updatePostById
module.exports.deletePostById = deletePostById
