export const LEVELS = [
  {
    id: 1, name: 'Neighborhood', theme: '#7ec850',
    startCol: 2, startRow: 3,
    missionIds: ['leaveHouse', 'buyTea'],
    grid: [
      ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
      ['W','B','B','B','B','W','W','W','W','W','W','W','W','W','B','B','B','B','B','W'],
      ['W','B','F','F','F','W','W','W','W','W','W','W','W','W','B','F','F','F','B','W'],
      ['W','B','F','F','F','W','W','W','W','W','W','W','W','W','B','F','F','F','B','W'],
      ['W','B','F','F','F','W','G','G','G','G','G','G','G','G','B','F','F','F','B','W'],
      ['W','B','B','D','B','W','G','G','G','G','G','G','G','G','B','F','D','F','B','W'],
      ['W','W','W','R','W','W','G','G','G','G','G','G','G','G','W','W','R','W','W','W'],
      ['W','W','W','R','W','G','G','G','G','G','G','G','G','G','G','G','R','G','W','W'],
      ['W','W','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','G','W','W'],
      ['W','W','W','G','W','G','G','G','G','G','G','G','G','G','G','G','G','G','W','W'],
      ['W','W','W','G','W','G','G','G','G','G','G','G','G','G','G','G','G','G','W','W'],
      ['W','W','W','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','W','W'],
      ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
      ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
      ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
    ],
    npcs: [
      { id: 'shopkeeper', col: 16, row: 3, dialogueId: 'shopkeeperDialogue' },
    ],
    dialogues: {
      shopkeeperDialogue: {
        npcId: 'shopkeeper', name: 'Shopkeeper',
        lines: [{ text: 'Welcome to my tea shop! What can I get for you?', choices: [
          { label: 'One tea please!', action: 'completeMission', missionId: 'buyTea' },
          { label: 'Just browsing',   action: 'closeDialogue' },
        ]}],
      },
    },
  },
  {
    id: 2, name: 'Market District', theme: '#e8a030',
    startCol: 2, startRow: 7,
    missionIds: ['findItems', 'payVendor', 'deliverGoods'],
    grid: [
      ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','W'],
      ['W','G','B','B','B','G','G','B','B','B','G','G','B','B','B','G','G','G','G','W'],
      ['W','G','B','F','B','G','G','B','F','B','G','G','B','F','B','G','G','G','G','W'],
      ['W','G','B','F','D','G','G','B','F','D','G','G','B','F','D','G','G','G','G','W'],
      ['W','G','B','B','B','G','G','B','B','B','G','G','B','B','B','G','G','G','G','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','W'],
      ['W','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','W'],
      ['W','G','B','B','G','G','G','G','G','G','G','G','G','G','G','G','G','B','G','W'],
      ['W','G','B','F','D','G','G','G','G','G','G','G','G','G','G','G','D','F','G','W'],
      ['W','G','B','B','G','G','G','G','G','G','G','G','G','G','G','G','G','B','G','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','W'],
      ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
      ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
    ],
    npcs: [
      { id: 'vendor',   col: 13, row: 4,  dialogueId: 'vendorDialogue' },
      { id: 'receiver', col: 16, row: 10, dialogueId: 'receiverDialogue' },
    ],
    dialogues: {
      vendorDialogue: {
        npcId: 'vendor', name: 'Market Vendor',
        lines: [{ text: 'Fresh goods! That will be 5 coins. Ready to pay?', choices: [
          { label: 'Pay 5 coins', action: 'completeMission', missionId: 'payVendor' },
          { label: 'Not yet',     action: 'closeDialogue' },
        ]}],
      },
      receiverDialogue: {
        npcId: 'receiver', name: 'Delivery Receiver',
        lines: [{ text: 'Oh, you have my goods! Thank you so much.', choices: [
          { label: 'Hand over goods', action: 'completeMission', missionId: 'deliverGoods' },
          { label: 'One moment',      action: 'closeDialogue' },
        ]}],
      },
    },
  },
  {
    id: 3, name: 'Office Building', theme: '#5080c0',
    startCol: 2, startRow: 12,
    missionIds: ['getBadge', 'attendMeeting', 'fileReport'],
    grid: [
      ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
      ['W','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','W'],
      ['W','F','B','B','B','B','F','F','F','F','F','F','F','B','B','B','B','B','F','W'],
      ['W','F','B','F','F','B','F','F','F','F','F','F','F','B','F','F','F','B','F','W'],
      ['W','F','B','F','F','D','F','F','F','F','F','F','F','B','F','F','F','D','F','W'],
      ['W','F','B','B','B','B','F','F','F','F','F','F','F','B','B','B','B','B','F','W'],
      ['W','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','W'],
      ['W','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','F','W'],
      ['W','F','B','B','B','B','B','B','F','F','F','F','F','F','F','F','F','F','F','W'],
      ['W','F','B','F','F','F','F','B','F','F','F','F','F','F','F','F','F','F','F','W'],
      ['W','F','B','F','F','F','F','D','F','F','F','F','F','F','F','B','B','B','F','W'],
      ['W','F','B','B','B','B','B','B','F','F','F','F','F','F','F','B','F','B','F','W'],
      ['W','F','F','F','F','F','F','F','F','F','F','F','F','F','F','D','F','B','F','W'],
      ['W','W','W','W','W','W','W','W','W','W','R','R','R','R','R','R','F','F','F','W'],
      ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
    ],
    npcs: [
      { id: 'receptionist', col: 16, row: 3,  dialogueId: 'receptionistDialogue' },
      { id: 'manager',      col: 15, row: 10, dialogueId: 'managerDialogue' },
    ],
    dialogues: {
      receptionistDialogue: {
        npcId: 'receptionist', name: 'Receptionist',
        lines: [{ text: 'Good morning! Here is your access badge. The conference room is upstairs.', choices: [
          { label: 'Thank you', action: 'completeMission', missionId: 'getBadge' },
        ]}],
      },
      managerDialogue: {
        npcId: 'manager', name: 'Manager',
        lines: [{ text: 'Excellent work today. Please submit your report here.', choices: [
          { label: 'Submit report',    action: 'completeMission', missionId: 'fileReport' },
          { label: 'Not finished yet', action: 'closeDialogue' },
        ]}],
      },
    },
  },
  {
    id: 4, name: 'Park & Cafe', theme: '#50b878',
    startCol: 1, startRow: 7,
    missionIds: ['meetFriend', 'fetchOrder', 'solveErrand'],
    grid: [
      ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','W'],
      ['W','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','D','F','F','B','G','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','B','F','F','B','G','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','B','B','B','B','G','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','W'],
      ['W','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','G','W'],
      ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
    ],
    npcs: [
      { id: 'friend',  col: 9,  row: 4, dialogueId: 'friendDialogue' },
      { id: 'friend2', col: 15, row: 9, dialogueId: 'friend2Dialogue' },
    ],
    dialogues: {
      friendDialogue: {
        npcId: 'friend', name: 'Your Friend',
        lines: [{ text: 'Hey! Great to see you. Could you grab my order from the cafe counter?', choices: [
          { label: 'Sure, I will get it!', action: 'completeMission', missionId: 'meetFriend' },
          { label: 'Give me a minute',     action: 'closeDialogue' },
        ]}],
      },
      friend2Dialogue: {
        npcId: 'friend2', name: 'Your Friend',
        lines: [{ text: 'Oh you got it! Thank you so much, you are the best.', choices: [
          { label: 'No problem!', action: 'completeMission', missionId: 'solveErrand' },
        ]}],
      },
    },
  },
  {
    id: 5, name: 'City Center', theme: '#c060d0',
    startCol: 2, startRow: 7,
    missionIds: ['startChain', 'finalDelivery', 'returnHome'],
    grid: [
      ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
      ['W','B','B','B','B','W','W','B','B','B','B','W','W','B','B','B','B','W','W','W'],
      ['W','B','F','F','B','W','W','B','F','F','B','W','W','B','F','F','B','W','W','W'],
      ['W','B','F','F','D','R','R','D','F','F','D','R','R','D','F','F','B','W','W','W'],
      ['W','B','B','D','B','W','W','B','B','B','B','W','W','B','B','B','B','W','W','W'],
      ['W','W','W','R','W','W','W','W','R','W','W','W','W','W','R','W','W','W','W','W'],
      ['W','W','W','R','W','W','W','W','R','W','W','W','W','W','R','W','W','W','W','W'],
      ['W','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','W'],
      ['W','W','W','R','W','W','W','W','R','W','W','W','W','W','R','W','W','W','W','W'],
      ['W','W','W','R','W','W','W','W','R','W','W','W','W','W','R','W','W','W','W','W'],
      ['W','B','B','D','B','W','W','B','D','B','B','W','W','B','D','B','B','W','W','W'],
      ['W','B','F','F','B','W','W','B','F','F','B','W','W','B','F','F','B','W','W','W'],
      ['W','B','F','F','B','W','W','B','F','F','B','W','W','B','F','F','B','W','W','W'],
      ['W','B','B','B','B','W','W','B','B','B','B','W','W','B','B','B','B','W','W','W'],
      ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
    ],
    npcs: [
      { id: 'courier',   col: 8,  row: 3, dialogueId: 'courierDialogue' },
      { id: 'recipient', col: 14, row: 3, dialogueId: 'recipientDialogue' },
    ],
    dialogues: {
      courierDialogue: {
        npcId: 'courier', name: 'City Courier',
        lines: [{ text: 'You have been selected for a special delivery! Take this package to the east building.', choices: [
          { label: 'I will do it!', action: 'completeMission', missionId: 'startChain' },
          { label: 'Tell me more',  action: 'closeDialogue' },
        ]}],
      },
      recipientDialogue: {
        npcId: 'recipient', name: 'Package Recipient',
        lines: [{ text: 'Finally! This is exactly what we needed. You have saved the day!', choices: [
          { label: 'Happy to help', action: 'completeMission', missionId: 'finalDelivery' },
        ]}],
      },
    },
  },
]
