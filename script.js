/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

const classifier = knnClassifier.create();
// prints "hi" in the browser's dev tools console
console.log('hi');



const webcamElement = document.getElementById('webcam');


async function setupWebcam(){
  return new Promise((resolve, reject) => {
    const navigatorAny = navigator;
    navigator.getUserMedia = navigator.getUserMedia ||
        navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
        navigatorAny.msGetUserMedia;
    if(navigator.getUserMedia){
      navigator.getUserMedia({video: true},
      stream => {
        webcamElement.srcObject = stream;
        webcamElement.addEventListener('loadeddata', () => resolve(), false); 
      },
        error => reject());
    }  else {
      reject();
    }    
  });
}

let net;

async function app(){
  

  console.log('loading MobileNet..');
  
  
  //load the model
  net = await mobilenet.load();
  console.log('model loaded successfully.');
  
  await setupWebcam();
  
  
  //now get img from webcam - associate it w/ a given class index
  const addExample = classId => {
  
    //get intermediate activation mobilenet 'conv_preds' and pass them on
    const activation = net.infer(webcamElement, 'conv_preds');
    //pass activation to the knn classifier
    classifier.addExample(activation, classId);
  };
  
  //click button, and add example for that class. 
  document.getElementById('class-a').addEventListener('click', () => addExample(0));
  document.getElementById('class-b').addEventListener('click', () => addExample(1));
  document.getElementById('class-c').addEventListener('click', () => addExample(2));
  
  //extra: another class w/ no action for default? hmm
 
  while (true) {
    
    if (classifier.getNumClasses() > 0){
      //get activation from mobilnet from webcam
      const activation = net.infer(webcamElement, 'conv_preds');
      //get most likely confs/classes from classifier module
      const result = await classifier.predictClass(activation)
      
      const classes = ['A', 'B', 'C', 'D'];
      document.getElementById('console').innerText = `
        prediction: ${classes[result.classIndex]}\n
        probability: ${result.confidences[result.classIndex]}
  `;
    }
    //code from just video w/o classes. 
//     const result = await net.classify(webcamElement);
    
//     document.getElementById('console').innerText = `
//         prediction: ${result[0].className}\n
//         probability: ${result[0].probability}
// `;
    
  //give some room waiting for next frame to fire
  await tf.nextFrame();
  }
  

  
  //make prediction thru the model on our img
  //const imgEl = document.getElementById('img');
  // const result = await net.classify(imgEl);
  //console.log(result);
}

app();