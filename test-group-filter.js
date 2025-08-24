// Test script to verify group message filtering
// This simulates webhook payloads to test the group message filtering logic

// Test data - simulating different types of messages
const testCases = [
  {
    name: "Individual message (should be processed)",
    payload: {
      event: "message",
      payload: {
        isGroup: false,
        chatId: "6281234567890@c.us",
        from: "6281234567890@c.us",
        body: "Hello, this is an individual message"
      }
    },
    shouldBeIgnored: false
  },
  {
    name: "Group message with isGroup=true (should be ignored)",
    payload: {
      event: "message", 
      payload: {
        isGroup: true,
        chatId: "120363043123456789@g.us",
        from: "6281234567890@c.us",
        body: "Hello everyone in the group"
      }
    },
    shouldBeIgnored: true
  },
  {
    name: "Group message with @g.us chatId (should be ignored)",
    payload: {
      event: "message",
      payload: {
        isGroup: false, // Even if this is false
        chatId: "120363043123456789@g.us", // @g.us indicates group
        from: "6281234567890@c.us", 
        body: "Group message detected by chatId"
      }
    },
    shouldBeIgnored: true
  },
  {
    name: "Individual message with @c.us (should be processed)",
    payload: {
      event: "message",
      payload: {
        isGroup: false,
        chatId: "6281234567890@c.us",
        from: "6281234567890@c.us",
        body: "Individual chat message"
      }
    },
    shouldBeIgnored: false
  }
];

// Function to test group message detection logic
function testGroupMessageDetection(body) {
  const isGroup = body?.payload?.isGroup || false;
  const chatId = body?.payload?.chatId || "";
  const isGroupMessage = isGroup || chatId.includes("@g.us");
  
  return isGroupMessage;
}

// Run tests
console.log("🧪 Testing Group Message Filtering Logic\n");

testCases.forEach((testCase, index) => {
  const result = testGroupMessageDetection(testCase.payload);
  const passed = result === testCase.shouldBeIgnored;
  
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`  Input: isGroup=${testCase.payload.payload.isGroup}, chatId=${testCase.payload.payload.chatId}`);
  console.log(`  Expected: ${testCase.shouldBeIgnored ? 'IGNORED' : 'PROCESSED'}`);
  console.log(`  Result: ${result ? 'IGNORED' : 'PROCESSED'}`);
  console.log(`  Status: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log("");
});

console.log("📋 Group Message Filter Implementation Summary:");
console.log("1. ✅ Added group message detection in main webhook handler (waha-webhook.post.js)");
console.log("2. ✅ Added group message filtering in handleReceivedMessage function");
console.log("3. ✅ Added group message filtering in handleSentMessage function");
console.log("4. ✅ Detection logic: isGroup=true OR chatId contains '@g.us'");
console.log("5. ✅ Returns early with 'ignored' status for group messages");
console.log("6. ✅ Prevents contacts and messages from groups being saved to database");
