var u = document.getElementsByClassName('unread'); 
for(sum = 0, i = 0; (e = u[i]) && i < u.length; i++) {
  unread = isNaN(parseInt(e.innerHTML)) ? 0 : parseInt(e.innerHTML); sum += unread; console.log(i, sum);
}; 
console.log('UNREAD: ' + sum;
