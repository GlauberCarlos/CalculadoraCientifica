// fazer
//ajustar tokenizer, teste manual com ordens erradas.

let sentence = "";
let stack = [];
let activeResult = false;
let screen = document.querySelector(".screen");
let buttons = document.querySelectorAll(".btn");
let operators = document.querySelectorAll(".btnOp");
let reset = document.getElementById("reset").addEventListener("click", clearScreen);

buttons.forEach(btn => {
   btn.addEventListener("click", () => {
      const value = btn.getAttribute("data-value");

      if (activeResult) {
         sentence = value;
         screen.textContent = sentence;
         console.log(sentence); 
         activeResult = false;
      }
      else{
         sentence += value;
         screen.textContent = sentence;
         console.log(sentence);      
      }
   })
});

operators.forEach(btn => {
   btn.addEventListener("click", () => {
      const valueOp = btn.getAttribute("data-value");
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
         screen.textContent = sentence;
         activeResult = false;
      }
   })
});

function clearScreen (){
   screen.textContent = "0";
   sentence = "";
   stack.length = 0;
   console.log(stack);
};

function btnEqual (){
   stack = []
   let tokens = manualTokenizer(sentence); // simulacao - criar um array com cada item
   let rpn = shuntingYard(tokens); // criar 2 arrays output e operator; ordena os itens e coloca todos em output
   calcular(rpn);      
};

let expr = "1+2";

function manualTokenizer(expr) { //cria o array
   let tokenList = [];
   let numberBuffer = "";

   for (let i = 0; i < expr.length ; i++ ) {
      let char = expr[i];

      if (char == "*" || char == "/" || char == "^" || char == ")") {
         if (i == 0 
            || tokenList[tokenList.length - 1] == "+" 
            || tokenList[tokenList.length - 1] == "-" 
            || tokenList[tokenList.length - 1] == "/" 
            || tokenList[tokenList.length - 1] == "(" 
            || tokenList[tokenList.length - 1] == "^"
            || tokenList[tokenList.length - 1] == "*"  ) {
            console.log("operacao nao permitida");
         }else {
            if (numberBuffer.length > 0){
               tokenList.push(numberBuffer);
            }
            tokenList.push(char);            
         }
      }
      else if (char == "(") {
         if (numberBuffer.length > 0){
               tokenList.push(numberBuffer);
         }
         tokenList.push(char);
      }
      else if (char == "+" || char == "-" ){
         if (tokenList[tokenList.length - 1] == "+" 
            || tokenList[tokenList.length - 1] == "-" 
            || tokenList[tokenList.length - 1] == "^" ) {
            console.log("operacao nao permitida");
         }else {
            if (numberBuffer.length == 0){
               numberBuffer += char;
            }else{
               tokenList.push(char);
            }
         }
      }
      else if (char == ".") {
         if (numberBuffer.length == 0) {
            numberBuffer = 0 + char;
         }else {
            if (numberBuffer.includes(".")){
               console.log("operacao nao permitida");
            }else {
               numberBuffer += char;
            }
         }
      }
      else if (!isNaN(parseFloat(char)) && char !== " ") {
         numberBuffer += char;
      }    
   }
   if (numberBuffer.length > 0 ) {
      tokenList.push(numberBuffer);
      numberBuffer = "";
   }

   return tokenList;

}

const peso = {
   "+":1,
   "-":1,
   "*":2,
   "/":2,
}

function shuntingYard(tokens) { //coloca o array em ordem polonesa
   const outputQueue = [];
   const operatorStack = [];

   tokens.forEach (token => {
      if(!isNaN(token)) { //se for número
         outputQueue.push(token);
      }
      else { //se for operador, etc
         while (
            operatorStack.length > 0 && peso[operatorStack.at(-1)] >= peso[token]){
               outputQueue.push(operatorStack.pop()); // o operador que já estava na fila vai para o output
         }
         operatorStack.push(token); // o operador recem chegado vai para o output
      }
   });

   while (operatorStack.length > 0) {
      outputQueue.push(operatorStack.pop());
   }
   
   console.log(outputQueue)
   return outputQueue;
}

function calcular(rpn) { // faz a conta depois de ordenar
   // rpn.unshift("0")
   console.log(rpn)
   rpn.forEach(token => {
      if(!isNaN(token)) { //se for número
         stack.push(Number(token));      }
      else {
         let b = stack.pop();
         let a = stack.pop();         

         switch (token) {
            case "+": stack.push(a + b); break;
            case "-": stack.push(a - b); break;
            case "*": stack.push(a * b); break;
            case "/": stack.push(a / b); break;            
         }
      }
   });

   screen.textContent = stack[0];
   sentence = stack[0];
   console.log(sentence);
   activeResult = true;
   return stack[0];
}
