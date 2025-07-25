// mongoose-test.js
const mongoose = require('mongoose');

// 接続文字列（必要に応じて変更）
const mongoURI = 'mongodb://127.0.0.1:27017/testdb'; // testdb は任意のデータベース名

// 簡易な User スキーマを作成
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
});

const User = mongoose.model('User', userSchema);

// 接続して保存テスト
async function testMongoDB() {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB 接続成功');

    const newUser = new User({
      username: 'naoki',
      email: 'naoki@example.com',
    });

    const result = await newUser.save();
    console.log('📦 ユーザー保存成功:', result);

  } catch (error) {
    console.error('❌ エラー発生:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 接続解除');
  }
}

testMongoDB();