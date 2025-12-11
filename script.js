// fazer
//tokenizer manual

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

// Algoritmo shunting yard
// 
// 

function btnEqual (){
   stack = []
   let tokens = tokenize(sentence); // simulacao - criar um array com cada item
   let rpn = shuntingYard(tokens); // criar 2 arrays output e operator; ordena os itens e coloca todos em output
   calcular(rpn);      
};


function tokenize(expr) { //cria o array
   //  return expr.match(/[+-]?\d+(?:\.\d+)?|\+|\-|\*|\//g); // inclui decimais e negativos
    return expr.match(/\d+(?:\.\d+)?|\+|\-|\*|\//g); // inclui decimais
   //  return expr.match(/\d+|\+|\-|\/|\*/g); // apenas inteiros
}
// console.log(tokenize("1-12+3*4/8")); //teste do tokenize

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
