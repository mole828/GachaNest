
const log = (params?:string) => {
    return (target:any,methodName:any,desc:any)=>{
        console.log(target, methodName, desc);
        console.log('方法装饰器')
    }
}

class Person{
    name: String;

    @log()
    say(){
        console.log(`I'm ${this.name}`);
    }
}

if(require.main===module){
    (async function() {
        const p = new Person();
        p.name = 'bob';
        p.say();
    })()
}