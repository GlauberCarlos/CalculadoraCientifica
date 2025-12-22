
let sentence = "";
let stack = [];
let activeResult = false;
let screen = document.querySelector(".screen");
let buttons = document.querySelectorAll(".btn");
let operators = document.querySelectorAll(".btnOp");
let backspace = document.querySelector(".btnBack");
let reset = document.getElementById("reset").addEventListener("click", clearScreen);

let history = [];
let histAS
let histAR
let histSent = document.querySelectorAll(".hist-sent");
let histRes = document.querySelectorAll(".hist-res");

document.querySelector(".history-icon").addEventListener("click", () => {
   document.querySelector(".historic").classList.toggle("historic-show");
   document.querySelector(".calc-body").classList.toggle("calc-body-show");
})

const peso = {
   "+":1,
   "-":1,
   "*":2,
   "/":2,
   "^":3
}

//tamanho fonte no screen
function fontSize(size){
   if (size <= 8){
      screen.style.fontSize = "3.5rem"
   }
   else if (size > 15){
      screen.style.fontSize = "1rem"
   }
   else if (size > 8){
      screen.style.fontSize = "2rem"
   }
}

backspace.addEventListener("click", () => {
   if (activeResult){
      sentence = screen.textContent;
      activeResult = false;
   }
   sentence = sentence.slice(0,-1);
   screen.textContent = sentence;
})

buttons.forEach(btn => {
   btn.addEventListener("click", () => {
      const value = btn.getAttribute("data-value");
      fontSize(screen.textContent.length)

      if (activeResult && value != ".") {
         sentence = value;
         screen.textContent = sentence.replace(/\*/g,"x").replace(/\//g,"÷");
         console.log(sentence); 
         activeResult = false;
      }else if (value == "."){         
         activeResult = false;
         sentence = screen.textContent.replace(/x/g,"*").replace(/÷/g,"/");
         sentence += value;
         screen.textContent = sentence.replace(/\*/g,"x").replace(/\//g,"÷");
      }else{
         sentence += value;
         screen.textContent = sentence.replace(/\*/g,"x").replace(/\//g,"÷");
         console.log(sentence);      
      }
   })
});

operators.forEach(btn => {
   btn.addEventListener("click", () => {
      const valueOp = btn.getAttribute("data-value");
      fontSize(screen.textContent.length)

      console.log(valueOp);
      if (valueOp == "="){
         if (activeResult){
            return
         }
         else{
            btnEqual();
         }
      }
      else {
         sentence += valueOp;
         console.log(sentence);
         screen.textContent = sentence.replace(/\*/g,"x").replace(/\//g,"÷");
         activeResult = false;
      }
   })
});

function clearScreen (){
   screen.textContent = "0";
   sentence = "";
   stack.length = 0;
   console.log(stack);
   fontSize(screen.textContent.length)
};

function btnEqual (){
   stack = []
   let tokens = manualTokenizer(sentence); // simulacao - criar um array com cada item
   if(!tokens) {
      console.log("Retornou erro na conta")
      screen.textContent = "Erro";
      sentence = "";
      return      
   }
   let rpn = shuntingYard(tokens); // criar 2 arrays output e operator; ordena os itens e coloca todos em output
   if(!rpn) {
      console.log("Retornou erro na conta")
      screen.textContent = "Erro";
      sentence = "";
      return      
   }
   calcular(rpn);   
};

function manualTokenizer(expr) { //cria o array
   let tokenList = [];
   let numberBuffer = "";

   for (let i = 0; i < expr.length ; i++ ) {
      let char = expr[i];
      let prev = tokenList[tokenList.length - 1];

      if (char == "*" || char == "/" || char == "^" || char == ")") {
         if (i == 0 
            || prev == "+" 
            || prev == "-" 
            || prev == "/" 
            || prev == "(" 
            || prev == "^"
            || prev == "*"  ) {
            console.log("operacao nao permitida 1");            
            return(null);
         }else if (char == ")" && !isNaN(expr[i+1])){
            tokenList.push(char);
            tokenList.push("*");
         }
         else {
            if (numberBuffer.length > 0){
               tokenList.push(numberBuffer);
            }
            tokenList.push(char);            
         }
      }
      else if (char == "(") {
         if (
            prev !== undefined &&
            prev !== "+" &&
            prev !== "-" &&
            prev !== "*" &&
            prev !== "/" &&
            prev !== "^" &&
            prev !== "("

         ){
               tokenList.push("*");
         }
         tokenList.push(char);
      }
      else if (char == "+" || char == "-" ){
         if (prev == "+" 
            || prev == "-" 
            || prev == "^" ) {
            console.log("operacao nao permitida 2");
            return(null);
         }else if (numberBuffer.length == 0){
            if (!isNaN(parseFloat(expr[i-1]))){
               tokenList.push(char);
            }else if(expr[i+1] == "("){
               tokenList.push("0");
               tokenList.push(char);
            }else{
               numberBuffer += char;
            }
         }else {            
            tokenList.push(char);            
            numberBuffer = "";
         }
      }
      else if (char == ".") {
         if (numberBuffer.length == 0) {
            numberBuffer = 0 + char;
         }else {
            if (numberBuffer.includes(".")){
               console.log("operacao nao permitida 3");
               return(null);
            }else {
               numberBuffer += char;
            }
         }
      }
      else if (!isNaN(parseFloat(char))) { 
         if (isNaN(parseFloat(expr[i+1]))){
            if (expr[i+1] == "."){
               numberBuffer += char;
            }else{
               numberBuffer += char;
               tokenList.push(numberBuffer);
               numberBuffer = "";
            }           
         }else{
            numberBuffer += char;
         }
      }    
   }
   if (numberBuffer.length > 0 ) {
      tokenList.push(numberBuffer);
      numberBuffer = "";
   }

   console.log(tokenList);
   return tokenList;

}


function shuntingYard(tokens) { //coloca o array em ordem polonesa
   const outputQueue = [];
   const operatorStack = [];
   let error = false;

   tokens.forEach (token => {
      if(!isNaN(token)) { //se for número
         outputQueue.push(token);
      }
      else if (token ==="("){
         operatorStack.push(token);
      }
      else if (token ===")"){
         if (!operatorStack.includes("(")){
            error = true;
            return (null);
         }
         while (operatorStack.at(-1) != "(") {
            outputQueue.push(operatorStack.pop());
         }
         operatorStack.pop();
      }
      else { //se for operador, etc
         while (
            operatorStack.length > 0 
            && peso[operatorStack.at(-1)] >= peso[token] 
            && token != "^"){
               outputQueue.push(operatorStack.pop()); // o operador que já estava na fila vai para o output
         }
         operatorStack.push(token); // o operador recem chegado vai para o output
      }
   });

   if (error) return null;
   
   if (operatorStack.includes("(")){
      return (null);
   }
   
   while (operatorStack.length > 0) {
      outputQueue.push(operatorStack.pop());
   }
   
   console.log(outputQueue)
   return outputQueue;
}

function calcular(rpn) { // faz a conta depois de ordenar
   console.log("rpn " + rpn)
   rpn.forEach(token => {
      if(!isNaN(token)) { //se for número
         stack.push(Number(token));      
      }else {
         let b = stack.pop();
         let a = stack.pop();         

         switch (token) {
            case "+": stack.push(a + b); break;
            case "-": stack.push(a - b); break;
            case "*": stack.push(a * b); break;
            case "/": stack.push(a / b); break;            
            case "^": stack.push(a ** b); break;            
         }
      }
   });

   histAS = screen.textContent; // para ir pro histórico
   histAR = Math.round(stack[0] * 10000) / 10000; // math round para cortar o monte de decimais
 
   screen.textContent = Math.round(stack[0] * 10000) / 10000;
   sentence = Math.round(stack[0] * 10000) / 10000;
   console.log(sentence);
   activeResult = true;
   fontSize(screen.textContent.length);
   putHistory();
   
   return Math.round(stack[0] * 10000) / 10000;
   // return stack[0];
}

function putHistory () {
   if (history.length > 9) history.pop();
   history.unshift({histAS, histAR})
   console.log(history)

   histSent.forEach((el, i) => {
      if (history[i]){
         el.textContent = history[i].histAS;
      } else {
         el.textContent = ""
      }
   })
   histRes.forEach((el, i) => {
      if (history[i]){
         el.textContent = history[i].histAR;
      } else {
         el.textContent = ""
      }
   })
}
