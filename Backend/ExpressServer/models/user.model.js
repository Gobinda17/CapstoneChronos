const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, { 
    timestamps: true 
});

userSchema.statics.getUserIdByEmail = async function(email) {
    const user = await this.findOne({ email });
    return user ? user._id : null;
};

module.exports = mongoose.model('Users', userSchema, 'Users');