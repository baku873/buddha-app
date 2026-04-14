const fs = require('fs');
const critical = [
  'app/api/bookings/route.ts',
  'app/api/bookings/[id]/route.ts', 
  'app/api/users/[id]/route.ts',
  'app/api/monks/[id]/route.ts',
  'app/api/auth/me/route.ts',
  'app/api/messages/route.ts',
];
critical.forEach(f => {
  if (!fs.existsSync(f)) console.error('MISSING ROUTE:', f);
  else console.log('OK:', f);
});
