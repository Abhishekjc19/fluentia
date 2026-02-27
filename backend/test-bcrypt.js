const bcrypt = require('bcrypt');

async function testBcrypt() {
  console.log('🧪 Testing bcrypt password hashing and comparison...\n');

  const testPassword = 'MyTestPassword123';
  const wrongPassword = 'WrongPassword456';

  // Hash the password
  console.log('1️⃣ Hashing password:', testPassword);
  const hashedPassword = await bcrypt.hash(testPassword, 10);
  console.log('✅ Hash created:', hashedPassword.substring(0, 20) + '...\n');

  // Test with correct password
  console.log('2️⃣ Testing with CORRECT password:', testPassword);
  const correctResult = await bcrypt.compare(testPassword, hashedPassword);
  console.log('Result:', correctResult, '| Type:', typeof correctResult);
  console.log('Status:', correctResult === true ? '✅ PASS' : '❌ FAIL\n');

  // Test with wrong password
  console.log('3️⃣ Testing with WRONG password:', wrongPassword);
  const wrongResult = await bcrypt.compare(wrongPassword, hashedPassword);
  console.log('Result:', wrongResult, '| Type:', typeof wrongResult);
  console.log('Status:', wrongResult === false ? '✅ PASS' : '❌ FAIL\n');

  // Summary
  console.log('📊 Test Summary:');
  console.log('Correct password check:', correctResult === true ? '✅ WORKING' : '❌ BROKEN');
  console.log('Wrong password check:', wrongResult === false ? '✅ WORKING' : '❌ BROKEN');

  if (correctResult === true && wrongResult === false) {
    console.log('\n🎉 Bcrypt is working correctly!');
  } else {
    console.log('\n⚠️  WARNING: Bcrypt validation has issues!');
  }
}

testBcrypt().catch(console.error);
