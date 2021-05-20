const app = {
    numOfCorrectAnswers: 0,
    index: 0,
    correctAnswer: '',
    alreadyAnswered: [],
    answersObject: {},
};

app.resetPage = () => {
    // resets page to beginning
    // hide the quiz and all buttons and messages
    app.introDivElement = $('.intro').hide();
    app.quizSectionElement = $('.quiz').hide();
    app.resultsDivElement = $('.resultsArea').hide();
    app.finishedDivElement = $('.finished').hide();
    // make sure drop down list is reset
    app.resetDropDown();
     // make sure the form is reset
    app.questionFormElement = $('#questionForm')
    app.questionFormElement[0].reset();
};

app.resetDropDown = () => {
    // resets the dropdown list 
    const dropDown = document.getElementById('categories');
    dropDown.selectedIndex = 0;
};

app.getSessionToken = async function getToken () {
    // retrieves a session token and assigns it to a variable to be used in API data call
    try {
        app.token = await $.ajax(`https://opentdb.com/api_token.php?command=request`);
        console.log(app.token);
    } catch(err) {
        console.log(err);
        alert(`The token request failed. Please reload the page and try again.`)
    }
};


app.getQuiz = async function getQuizByCategory() {
    // get API using category selected by the user with the session token that was generated
    try {
        const data = await $.ajax({
            url: 'https://opentdb.com/api.php',
            method: 'GET',
            dataType: 'json',
            data: {
                amount: 10,
                type: 'multiple',
                category: `${app.selectedCategory}`,
                token: app.token,
            }
        });
        console.log(data);
        // start quiz when the user clicks on the start button
        app.startButtonElement = $('#start').on('click', function() {
            // add h2 with animation
            app.introDivElement = $('.intro').append($(`<h2 class="animate__animated animate__lightSpeedInLeft">Let's Go!!!</h2>`));
        
            setTimeout(() => {
                // delay for 2 seconds while the animation completes
                //hide the category section with drop down and start button
                app.categorySectionElement = $('section.category').hide();
                    
                // show the quiz and results divs
                app.quizSectionElement.show();
                app.resultsDivElement.show();
        
                // show the first question
                app.askQuestion(data, app.index);
                }, 2000)
            });
            
            // when user clicks on check button to check answer
            app.questionFormElement.on('submit', function(event) {
                event.preventDefault();
                app.radioButtonElements = $('input[type="radio"]');
                if (app.radioButtonElements.is(':checked')) {
                    // disable radio buttons so answer can not be changed
                    app.radioButtonElements.attr('disabled', true);
                    // check the users answer
                    app.checkAnswer();
                    // add the current index to an array of questions already answered
                    app.alreadyAnswered.push(app.index);
                };
            });
            
            // when user clicks on next button
            app.nextButtonElement = $('#next').on('click', function() {
                // check that it is not the last question
                if (app.index < 10) {
                    app.index += 1;
                    // check if the current question has already been answered
                    app.checkIfQuestionWasAnswered(data);
                };
            });
        
            // when user clicks on previous button
            app.previousButtonElement = $('#previous').on('click', function() {
                if (app.index > 0) {
                    app.index -= 1;
                    app.checkIfQuestionWasAnswered(data);
                };
            });
    } catch(err) {
        alert( `Oops! Something went wrong retrieving the API. Please refresh the page and try again.`);
        console.log(err);
    };
}; // end of app.getQuiz

app.askQuestion = function (data, index) {
    //fill in info for the next question using the new value of i=index 
    app.h2QuestionElement = $('.question').text(`Question ${index + 1} of 10`);
    app.pCategoryElement = $('#category').text(`Category: ${data.results[index].category}`);
    app.pDifficultyElement = $('#difficulty').text(`Difficulty: ${data.results[index].difficulty}`);
    const question = app.decodeHtml(data.results[index].question);
    app.pQuestionElement = $('#question').text(`Question: ${question}`);
    
    // create an array with all answers  
    const answerArray = [data.results[index].correct_answer, data.results[index].incorrect_answers[0], data.results[index].incorrect_answers[1], data.results[index].incorrect_answers[2]];
    
    app.assignAnswers(answerArray);

    // assign the correct answer to a variable 
    app.correctAnswer = app.decodeHtml(data.results[index].correct_answer);

    // hide or show next and previous buttons depending on what the index is
    if (app.index === 9){
        app.nextButtonElement = $('#next').hide();
    }else if ((app.index === 0)){
        app.previousButtonElement = $('#previous').hide();
        app.nextButtonElement = $('#next').show();
    }else{
        app.nextButtonElement = $('#next').show();
        app.previousButtonElement = $('#previous').show();
    };
}; // end of app.askQuestion

app.assignAnswers = (answerArray) => {
    // randomly select one answer, assign it to a radio button 

    //remove class from radio button labels
    app.radioButtonLabels = $('label');
    app.radioButtonLabels.removeClass('makeRed');
    app.radioButtonLabels.removeClass('makeGreen');
   
    // assign a random answer to answer1
    const answer1 = app.getRandomAnswer(answerArray);
    const answer1decoded = app.decodeHtml(answer1);
    app.answer1RadioButtonLabel = $('label[for="answer1"').text(`${answer1decoded}`);
    app.answer1RadioButtonElement = $('#answer1').val(`${answer1decoded}`);
    
    // repeat for other radio buttons
    const answer2 = app.getRandomAnswer(answerArray);
    const answer2decoded = app.decodeHtml(answer2);
    app.answer2RadioButtonLabel = $('label[for="answer2"').text(`${answer2decoded}`);
    app.answer2RadioButtonElement = $('#answer2').val(`${answer2decoded}`);
    const answer3 = app.getRandomAnswer(answerArray);
    const answer3decoded = app.decodeHtml(answer3);
    app.answer3RadioButtonLabel =$('label[for="answer3"').text(`${answer3decoded}`);
    app.answer3RadioButtonElement = $('#answer3').val(`${answer3decoded}`);
    const answer4 = app.getRandomAnswer(answerArray);
    const answer4decoded = app.decodeHtml(answer4);
    app.answer4RadioButtonLabel =$('label[for="answer4"').text(`${answer4decoded}`);
    app.answer4RadioButtonElement = $('#answer4').val(`${answer4decoded}`);
};



app.getRandomAnswer = (answerArray) => {       
// returns a random number to randomize the placements of the answers
    const num = answerArray.length;
    // get a random number between 0 and the current length of answerArray
    const getRandomNum = (num) => {
        return Math.floor(Math.random() * num);
    };
    const ranNum = getRandomNum(num);
    // remove item from array and get return value
    return answerArray.splice(ranNum, 1);
};

app.decodeHtml = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}


 app.checkAnswer = () => {
    // checks if the user's answer matches the correct answer
    // hide the check answer button
    app.checkAnswerSubmitElement = $('#checkAnswer').hide();

    // assign the value of the selected radio button to a value that can be compared to the correct answer
    app.userAnswer = $('input[type="radio"]:checked').val();
    
    // store the user's answer and the correct answer in a nested object by the app.index
    app.answersObject[app.index] = {userAnswer: app.userAnswer, rightAnswer: app.correctAnswer};

    // check if the answer is correct
    if (app.userAnswer === app.correctAnswer) {
        app.pResultElement = $('.result').text('CORRECT!');
        app.numOfCorrectAnswers += 1;
        //change the color of the selected radio button to green

        app.changeSelectedLabel = $('input[type="radio"]:checked').next('label').addClass('makeGreen');

    } else {           
        app.pResultElement = $('.result').text(`INCORRECT! The correct answer is ${app.correctAnswer}`); 
        // change the color of the selected radio button to red
        app.changeSelectedLabel = $('input[type="radio"]:checked').next('label').addClass('makeRed');

    };
    // if it is the final question, display the number of correct answers and show the reset button
    
    if (app.index === 9) {
        app.endOfQuiz();
        };
}; // end of app.checkAnswer

app.checkIfQuestionWasAnswered = (data) => {
    if (app.alreadyAnswered.includes(app.index) ){
        // if question has already been answered, display question 
        app.askQuestion(data, app.index);
        // display answers given
        app.displayAlreadyAnswered();
    } else {
        // reset form and ask next question
        app.resetForm();
        app.askQuestion(data, app.index);
    };
};

app.displayAlreadyAnswered = () => {
    //displays that the question was answered and what the user's answer was and the correct answer
    app.pResultElement = $('.result').text(`This question was already answered. Your answer was ${app.answersObject[app.index].userAnswer}. The correct answer is ${app.answersObject[app.index].rightAnswer}.`);
    // clears the radio buttons
    app.radioButtonElements = $('input[type="radio"]').prop('checked', false);
    // hides the submit button
    app.checkAnswerSubmitElement = $('#checkAnswer').hide();
};

app.resetForm = () => {
    // resets the answer form, clears result text, shows the submit button and reanables the radio buttons
    app.questionFormElement[0].reset();
    app.pResultElement = $('.result').text('');
    app.checkAnswerSubmitElement = $('#checkAnswer').show();
    app.radioButtonElements = $('input[type="radio"]').prop('disabled', false);
};

app.endOfQuiz = () => {
    // when user has answered the final question
    // hide previous button
    app.previousButtonElement = $('#previous').hide();
    setTimeout(() => {
        //hide the quiz
        app.quizAreaDiv = $('.quizArea').hide();
        // show the results div with text and button
        app.finishedDivElement.show();
        app.pCorrectAnswersElement = $('#correctAnswers').text(`You got ${app.numOfCorrectAnswers} out of 10 questions right!`);
        app.pCorrectAnswersElement.addClass('animate_animated animate__tada');
        // when clicked, reset button will reload the page 
        app.resetQuizButtonElement = $('#resetQuiz').on('click', function () {
            location.reload();
        });
    }, 2000);
};


app.init = () => {
    app.resetPage();
    app.selectElement = $('select').on('change', function() {
        // show the intro div and create the start button
        app.introDivElement.show();
        app.startButtonElement = $('.intro').append($(`<button id="start">Start <i class="far fa-play-circle"></i></button>`));

        // assign the category selected by the user to a variable selectedCategory;
        app.selectedCategory = $('select option:selected' ).val();

        // API call to get session token
        app.getSessionToken();

        // API call for quiz data and start the quiz
        app.getQuiz();


    })
};

$(function() {
    app.init();
});