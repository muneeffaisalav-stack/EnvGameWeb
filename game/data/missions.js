export const MISSIONS = {
  // Level 1
  leaveHouse:    { id: 'leaveHouse',    title: 'Leave the House',      description: 'Step outside through the front door',         objectiveType: 'reachLocation', targetTileCol: 3, targetTileRow: 6 },
  buyTea:        { id: 'buyTea',        title: 'Buy a Cup of Tea',     description: 'Talk to the shopkeeper and order tea',         objectiveType: 'talkTo',        targetNpcId: 'shopkeeper' },
  // Level 2
  findItems:     { id: 'findItems',     title: 'Find the Market Stall',description: 'Walk to the vendor stall',                     objectiveType: 'reachLocation', targetTileCol: 14, targetTileRow: 4 },
  payVendor:     { id: 'payVendor',     title: 'Pay the Vendor',       description: 'Talk to the vendor and pay for the goods',     objectiveType: 'talkTo',        targetNpcId: 'vendor' },
  deliverGoods:  { id: 'deliverGoods',  title: 'Deliver the Goods',    description: 'Bring items to the receiver',                  objectiveType: 'talkTo',        targetNpcId: 'receiver' },
  // Level 3
  getBadge:      { id: 'getBadge',      title: 'Collect Your Badge',   description: 'Pick up your access badge from reception',     objectiveType: 'talkTo',        targetNpcId: 'receptionist' },
  attendMeeting: { id: 'attendMeeting', title: 'Attend the Meeting',   description: 'Go to the conference room on the first floor', objectiveType: 'reachLocation', targetTileCol: 15, targetTileRow: 3 },
  fileReport:    { id: 'fileReport',    title: 'File the Report',      description: 'Submit the report to your manager',            objectiveType: 'talkTo',        targetNpcId: 'manager' },
  // Level 4
  meetFriend:    { id: 'meetFriend',    title: 'Meet Your Friend',     description: 'Find your friend in the park',                 objectiveType: 'talkTo',        targetNpcId: 'friend' },
  fetchOrder:    { id: 'fetchOrder',    title: 'Fetch the Order',      description: 'Pick up the cafe order at the counter',        objectiveType: 'reachLocation', targetTileCol: 14, targetTileRow: 9 },
  solveErrand:   { id: 'solveErrand',   title: 'Return with the Order',description: 'Bring the order back to your friend',          objectiveType: 'talkTo',        targetNpcId: 'friend2' },
  // Level 5
  startChain:    { id: 'startChain',    title: 'Begin the Chain',      description: 'Talk to the courier at city hall',             objectiveType: 'talkTo',        targetNpcId: 'courier' },
  finalDelivery: { id: 'finalDelivery', title: 'Final Delivery',       description: 'Deliver the package to the recipient',         objectiveType: 'talkTo',        targetNpcId: 'recipient' },
  returnHome:    { id: 'returnHome',    title: 'Return Home',          description: 'Make your way back to the start tile',         objectiveType: 'reachLocation', targetTileCol: 2, targetTileRow: 7 },
}
