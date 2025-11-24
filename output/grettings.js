const args = process.argv;

const name = args[2] || 'guest';
const time = new Date().getHours();

let gretting ;

if(time < 12){
    gretting = 'Good Morning';
}else if(time < 18){
    gretting = 'Good Afternoon';
}else{
    gretting = 'Good Evening';
}

console.log(`${gretting},${name}`);
