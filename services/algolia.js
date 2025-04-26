import algoliasearch from 'algoliasearch';

const client = algoliasearch('7C5YDKSGYW', '186a9ba283ae350d078375091c0804a1');
const postsIndex = client.initIndex('posts');
const usersIndex = client.initIndex('users'); 

export { 
  postsIndex as index, 
  usersIndex as usersIndex
};
