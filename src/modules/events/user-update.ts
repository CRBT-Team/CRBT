// import { db } from '$lib/db';
// import { OnEvent } from 'purplet';

// export default OnEvent('userUpdate', (oldUser, newUser) => {
//   if (oldUser.tag !== newUser.tag) {
//     db.users.update({
//       where: { id: newUser.id },
//       data: {
//         past_usernames: {
//           push: oldUser.tag,
//         },
//       },
//     });
//   }
//   if (oldUser.avatar !== newUser.avatar) {
//     db.users.update({
//       where: { id: newUser.id },
//       data: {
//         past_avatars: {
//           push: oldUser.avatar,
//         },
//       },
//     });
//   }
// });
