// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Código para interactividad futura
    console.log('Plataforma de Métodos Numéricos cargada.');

    const methods = [
        { id: "serie-taylor", name: "Serie de Taylor", description: "Aproximación de funciones mediante series de potencias." },
        { id: "biseccion", name: "Bisección", description: "Encontrar raíces de ecuaciones dividiendo intervalos." },
        { id: "regla-falsa", name: "Regla Falsa", description: "Método similar a bisección pero con aproximación lineal." },
        // { id: "punto-fijo", name: "Punto Fijo", description: "Iteración para encontrar puntos fijos de funciones." }, // Eliminado
        { id: "newton-raphson", name: "Newton-Raphson", description: "Método iterativo rápido usando derivadas." },
        { id: "secante", name: "Secante", description: "Similar a Newton-Raphson, pero aproxima la derivada." },
        // { id: "raices-multiples", name: "Raíces Múltiples", description: "Modificaciones para encontrar raíces con multiplicidad." }, // Eliminado
        { id: "eliminacion-gaussiana", name: "Eliminación Gaussiana", description: "Resolución de sistemas de ecuaciones lineales por eliminación hacia adelante y sustitución hacia atrás." },
        { id: "metodo-inversa", name: "Método de la Inversa", description: "Resolución de sistemas Ax=b calculando A^{-1}." },
        { id: "regla-cramer", name: "Regla de Cramer", description: "Resolución de sistemas de ecuaciones lineales usando determinantes." },
        { id: "metodo-montante", name: "Método de Montante", description: "Algoritmo libre de fracciones para determinantes y sistemas de ecuaciones." },
        { id: "splines", name: "Splines de Interpolación", description: "Interpolación por tramos usando polinomios de bajo grado." },
        { id: "interpolacion-axb", name: "Interpolación Polinómica (Ax=b)", description: "Encontrar coeficientes de polinomio interpolador resolviendo sistema Va=y." },
        { id: "gauss-jordan", name: "Gauss-Jordan", description: "Resolución de sistemas de ecuaciones lineales llevando la matriz a forma escalonada reducida." },
        { id: "jacobi", name: "Jacobi", description: "Método iterativo para sistemas de ecuaciones lineales." },
        { id: "gauss-seidel", name: "Gauss-Seidel", description: "Método iterativo mejorado sobre Jacobi para sistemas de ecuaciones lineales." },
        // { id: "interpolacion-lineal", name: "Interpolación Lineal", description: "Aproximar valores usando una línea entre dos puntos." }, // Eliminado
        // { id: "interpolacion-cuadratica", name: "Interpolación Cuadrática", description: "Aproximar valores usando una parábola entre tres puntos." }, // Eliminado
        { id: "polinomio-newton", name: "Polinomio de Newton", description: "Construcción de polinomios de interpolación mediante diferencias divididas." },
        { id: "polinomio-lagrange", name: "Polinomio de Lagrange", description: "Otra forma de construir polinomios de interpolación." },
        // { id: "diferenciacion-numerica", name: "Diferenciación Numérica", description: "Aproximar derivadas de funciones." }, // Eliminado
        { id: "integracion-numerica", name: "Integración Numérica", description: "(Trapecio, Simpson 1/3, Simpson 3/8) Aproximar integrales definidas." },
        { id: "metodo-euler", name: "Método de Euler", description: "Resolución numérica de ecuaciones diferenciales ordinarias." },
        { id: "runge-kutta", name: "Runge-Kutta", description: "Familia de métodos para EDOs, más precisos que Euler." }
        // { id: "ajuste-curvas", name: "Ajuste de Curvas", description: "(Mínimos Cuadrados) Encontrar la curva que mejor se ajusta a los datos." } // Eliminado
    ];

    const navUl = document.querySelector('header nav ul');
    const cardsContainer = document.getElementById('method-cards-container');
    const isMethodPage = window.location.pathname.includes('/methods/');

    // Generar barra de navegación
    if (navUl) {
        navUl.innerHTML = ''; // Limpiar cualquier contenido estático previo
        // Enlace a la página principal/lista de métodos
        const homeLi = document.createElement('li');
        const homeLink = document.createElement('a');
        homeLink.textContent = 'Inicio (Todos los Métodos)';
        homeLink.href = isMethodPage ? '../index.html#method-cards-container' : '#method-cards-container';
        homeLi.appendChild(homeLink);
        navUl.appendChild(homeLi);

        // Enlaces a cada método
        methods.forEach(method => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            // Ajustar href basado en si estamos en index.html o en una página de método
            a.href = isMethodPage ? `${method.id}.html` : `methods/${method.id}.html`;
            // Si estamos en la página del método actual, podríamos marcarlo como activo (opcional)
            if (isMethodPage && window.location.pathname.endsWith(`${method.id}.html`)) {
                a.classList.add('active-nav-link'); // Necesitarás definir este estilo en CSS
            }
            a.textContent = method.name;
            li.appendChild(a);
            navUl.appendChild(li);
        });
    }

    // Placeholder para la barra de progreso (se desarrollará más adelante)
    const progressBarContainer = document.getElementById('progress-bar-container');
    if (progressBarContainer) {
        // Lógica para inicializar y actualizar la barra de progreso
        // Por ahora, un simple mensaje.
        // progressBarContainer.innerHTML = '<p>Barra de progreso global aparecerá aquí.</p>';
    }

    function displayQuizFeedback(pKey, correctAnswersMap) {
        const progress = getTaskProgress(pKey);
        const userAnswers = progress.user_quiz_answers;

        if (!quizForm || !userAnswers) { // Si no hay formulario o respuestas guardadas, no hacer nada
            return;
        }
        
        console.log('[DEBUG] displayQuizFeedback - Mostrando respuestas guardadas:', userAnswers);

        for (const [questionName, correctAnswer] of Object.entries(correctAnswersMap)) {
            const userAnswer = userAnswers[questionName];
            const questionContainer = quizForm.querySelector(`input[name="${questionName}"]`).closest('.quiz-question');
            const optionWrappers = questionContainer.querySelectorAll('.quiz-option-wrapper');
            
            optionWrappers.forEach(wrapper => {
                const input = wrapper.querySelector('input');
                const feedbackIcon = wrapper.querySelector('.feedback-icon');
                feedbackIcon.innerHTML = ''; 
                wrapper.classList.remove('correct-answer', 'incorrect-answer');
                input.checked = (input.value === userAnswer); // Marcar la opción que el usuario había seleccionado

                if (input.value === correctAnswer) {
                    wrapper.classList.add('correct-answer');
                    if (input.checked) {
                         feedbackIcon.innerHTML = '✔️';
                    }
                } else if (input.checked && input.value !== correctAnswer){
                    wrapper.classList.add('incorrect-answer');
                    feedbackIcon.innerHTML = '❌';
                }
            });
        }

        // Deshabilitar formulario si ya fue aprobado
        if (progress.quiz_passed === true) {
            quizForm.querySelectorAll('input[type="radio"]').forEach(radio => radio.disabled = true);
            const submitButton = quizForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Cuestionario Aprobado';
            }
             console.log('[DEBUG] displayQuizFeedback - Cuestionario aprobado, deshabilitando inputs.');
        } else {
            // Asegurarse de que el formulario esté habilitado si no está aprobado (por si se reintenta)
            quizForm.querySelectorAll('input[type="radio"]').forEach(radio => radio.disabled = false);
            const submitButton = quizForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Enviar Cuestionario';
            }
        }
    }

    // Lógica del Cuestionario
    const quizForm = document.getElementById('quiz-' + pageKey);
    console.log(`[DEBUG] quizForm: ${quizForm ? 'Encontrado' : 'NO ENCONTRADO'}`);
    if (quizForm) {
        // Definir correctAnswers aquí para que esté disponible para displayQuizFeedback al cargar la página
        const quizCorrectAnswers = { // Renombrado para evitar conflicto de scope si es necesario
            'q1-taylor': 'b',
            'q2-taylor': 'b'
        };

        // Mostrar retroalimentación guardada al cargar la página SI el cuestionario ya fue intentado
        const initialProgress = getTaskProgress(pageKey);
        if (initialProgress.quiz_attempted) {
            displayQuizFeedback(pageKey, quizCorrectAnswers);
        }

        quizForm.addEventListener('submit', function(event) {
            event.preventDefault(); 
            console.log('[DEBUG] Cuestionario enviado, recarga prevenida.');
            updateTaskStatusInStorage(pageKey, 'quiz_attempted', true);

            const formData = new FormData(quizForm);
            let score = 0;
            const totalQuestions = Object.keys(quizCorrectAnswers).length;
            
            const userSubmittedAnswers = {}; // Para guardar en localStorage

            for (const [questionName, correctAnswer] of Object.entries(quizCorrectAnswers)) {
                const userAnswer = formData.get(questionName);
                userSubmittedAnswers[questionName] = userAnswer; // Guardar respuesta actual
                if (userAnswer === correctAnswer) {
                    score++;
                }
            }
            
            // Guardar respuestas del usuario junto con el progreso
            const currentProgress = getTaskProgress(pageKey); // Releer para tener el quiz_attempted más reciente
            currentProgress.user_quiz_answers = userSubmittedAnswers; 
            localStorage.setItem(pageKey, JSON.stringify(currentProgress));

            const passed = (score === totalQuestions);
            updateTaskStatusInStorage(pageKey, 'quiz_passed', passed); // Esto llamará a calculateOverallProgress que llama a renderTaskStatus

            displayQuizFeedback(pageKey, quizCorrectAnswers); // Mostrar retroalimentación actualizada

            if (passed) {
                alert(`¡Cuestionario Aprobado! Puntaje: ${score}/${totalQuestions}`);
            } else {
                alert(`Cuestionario No Aprobado. Puntaje: ${score}/${totalQuestions}. Revisa las respuestas e intenta de nuevo.`);
            }
        });
        console.log('[DEBUG] Listener añadido a quizForm.');
    } else {
        console.warn('[DEBUG] quizForm no encontrado, no se añade listener.');
    }

    // --- LLAMADA INICIAL AL FINAL --- 
    console.log('[DEBUG] Llamando a calculateAndUpdateOverallProgress por primera vez al final de DOMContentLoaded.');
    calculateAndUpdateOverallProgress(pageKey); // Esto ya renderiza los íconos de tarea
});

// Función para marcar método como completado (ejemplo básico)
function toggleMethodCompletion(pageKey, buttonElement) {
    const isCompleted = localStorage.getItem(pageKey) === 'true';
    const newCompletedState = !isCompleted; // Invertir estado

    localStorage.setItem(pageKey, newCompletedState.toString()); // Guardar como string 'true' o 'false'

    // Actualizar el botón (si se proporciona)
    // Esta lógica podría moverse a un listener del evento si se prefiere centralizar actualizaciones de UI
    if (buttonElement) {
        if (newCompletedState) {
            buttonElement.textContent = 'Completado ✓';
            // Clases de ejemplo, ajusta según tu CSS para el estado completado del botón
            buttonElement.classList.add('bg-green-700', 'hover:bg-green-800');
            buttonElement.classList.remove('bg-green-600', 'hover:bg-green-700');
        } else {
            buttonElement.textContent = 'Marcar como Completado';
            buttonElement.classList.add('bg-green-600', 'hover:bg-green-700');
            buttonElement.classList.remove('bg-green-700', 'hover:bg-green-800');
        }
    }

    // Disparar un evento para que otras partes de la UI (como la barra de progreso) puedan reaccionar
    window.dispatchEvent(new CustomEvent('methodCompletionChanged', {
        detail: {
            pageKey: pageKey,
            completed: newCompletedState
        }
    }));
}

// Función para actualizar la barra de progreso global (MODIFICADA)
function updateGlobalProgress() {
    const methods = [
        // ... (lista completa de tus objetos 'method' como la tenías antes) ...
        // Ejemplo:
        { id: "serie-taylor", name: "Serie de Taylor" },
        { id: "biseccion", name: "Bisección" },
        { id: "regla-falsa", name: "Regla Falsa" },
        { id: "newton-raphson", name: "Newton-Raphson" },
        { id: "secante", name: "Secante" },
        { id: "eliminacion-gaussiana", name: "Eliminación Gaussiana" },
        { id: "metodo-inversa", name: "Método de la Inversa" },
        { id: "regla-cramer", name: "Regla de Cramer" },
        { id: "metodo-montante", name: "Método de Montante" },
        { id: "splines", name: "Splines de Interpolación" },
        { id: "interpolacion-axb", name: "Interpolación Polinómica (Ax=b)" },
        { id: "gauss-jordan", name: "Gauss-Jordan" },
        { id: "jacobi", name: "Jacobi" },
        { id: "gauss-seidel", name: "Gauss-Seidel" },
        { id: "polinomio-newton", name: "Polinomio de Newton" },
        { id: "polinomio-lagrange", name: "Polinomio de Lagrange" },
        { id: "integracion-numerica", name: "Integración Numérica" },
        { id: "metodo-euler", name: "Método de Euler" },
        { id: "runge-kutta", name: "Runge-Kutta" }
    ];

    let totalPercentageSum = 0;
    let methodsWithProgress = 0; // Contar cuántos métodos tienen datos de progreso granular

    methods.forEach(method => {
        const progressData = localStorage.getItem(method.id);
        if (progressData) {
            try {
                const progressObj = JSON.parse(progressData);
                // Verificar si es el objeto de progreso granular (tiene overall_progress)
                if (typeof progressObj === 'object' && progressObj !== null && typeof progressObj.overall_progress === 'number') {
                    totalPercentageSum += progressObj.overall_progress;
                    methodsWithProgress++;
                }
                // Si no es el objeto granular, verificar si es el booleano antiguo 'true'
                else if (progressData === 'true') { // Manejar el caso antiguo
                    totalPercentageSum += 100; // Considerar 100% si era true
                    methodsWithProgress++;
                } else {
                    // Si es 'false' o un objeto no válido, suma 0%, no incrementa methodsWithProgress
                }
            } catch (e) {
                 // Si no es JSON válido o 'true'/'false', es un dato antiguo/inválido, suma 0%
                 console.warn(`Invalid progress data for ${method.id}:`, progressData);
            }
        }
        // Si no hay dato en localStorage, suma 0%
    });

    const totalMethods = methods.length;
    // El progreso global es el promedio de los porcentajes de cada método
    const globalProgressPercentage = totalMethods > 0 ? (totalPercentageSum / totalMethods) : 0;
    // Para el texto, podemos mostrar cuántos métodos tienen > 0% de progreso, o el promedio %.
    // Mostremos el promedio %.

    const progressBar = document.getElementById('global-progress-bar');
    const progressText = document.getElementById('global-progress-text');

    if (progressBar) {
        progressBar.style.width = `${globalProgressPercentage}%`;
    }
    if (progressText) {
        // Texto más informativo
        progressText.textContent = `Progreso General: ${globalProgressPercentage.toFixed(1)}%`;
    }
    console.log(`Progreso global calculado: ${globalProgressPercentage.toFixed(1)}%`);
}

// Reemplaza la llamada anterior a updateGlobalProgress
// document.addEventListener('DOMContentLoaded', updateGlobalProgress);
// Llama también cuando una tarea de cualquier método cambia (necesitamos un evento más global)
// Por ahora, la actualizaremos solo al cargar la página
document.addEventListener('DOMContentLoaded', updateGlobalProgress);

// Idealmente, también llamaríamos a updateGlobalProgress cuando 'calculateAndUpdateOverallProgress'
// se ejecuta en *cualquier* página de método. Esto requiere comunicación entre páginas
// o recalcular siempre en DOMContentLoaded. Por ahora, solo en DOMContentLoaded está bien. 

function displayQuizFeedback(pageKey, correctAnswers) {
    const progress = getTaskProgress(pageKey);
    const userAnswers = progress.user_quiz_answers;

    if (!quizForm || !userAnswers) { // Si no hay formulario o respuestas guardadas, no hacer nada
        return;
    }
    
    console.log('[DEBUG] displayQuizFeedback - Mostrando respuestas guardadas:', userAnswers);

    for (const [questionName, correctAnswer] of Object.entries(correctAnswers)) {
        const userAnswer = userAnswers[questionName];
        const questionContainer = quizForm.querySelector(`input[name="${questionName}"]`).closest('.quiz-question');
        const optionWrappers = questionContainer.querySelectorAll('.quiz-option-wrapper');
        
        optionWrappers.forEach(wrapper => {
            const input = wrapper.querySelector('input');
            const feedbackIcon = wrapper.querySelector('.feedback-icon');
            feedbackIcon.innerHTML = ''; 
            wrapper.classList.remove('correct-answer', 'incorrect-answer');
            input.checked = (input.value === userAnswer); // Marcar la opción que el usuario había seleccionado

            if (input.value === correctAnswer) {
                wrapper.classList.add('correct-answer');
                if (input.checked) {
                     feedbackIcon.innerHTML = '✔️';
                }
            } else if (input.checked && input.value !== correctAnswer){
                wrapper.classList.add('incorrect-answer');
                feedbackIcon.innerHTML = '❌';
            }
        });
    }

    // Deshabilitar formulario si ya fue aprobado
    if (progress.quiz_passed === true) {
        quizForm.querySelectorAll('input[type="radio"]').forEach(radio => radio.disabled = true);
        const submitButton = quizForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Cuestionario Aprobado';
        }
         console.log('[DEBUG] displayQuizFeedback - Cuestionario aprobado, deshabilitando inputs.');
    } else {
        // Asegurarse de que el formulario esté habilitado si no está aprobado (por si se reintenta)
        quizForm.querySelectorAll('input[type="radio"]').forEach(radio => radio.disabled = false);
        const submitButton = quizForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Enviar Cuestionario';
        }
    }
}

// Lógica del Cuestionario
const quizForm = document.getElementById('quiz-' + pageKey);
console.log(`[DEBUG] quizForm: ${quizForm ? 'Encontrado' : 'NO ENCONTRADO'}`);
if (quizForm) {
    // Definir correctAnswers aquí para que esté disponible para displayQuizFeedback al cargar la página
    const quizCorrectAnswers = { // Renombrado para evitar conflicto de scope si es necesario
        'q1-taylor': 'b',
        'q2-taylor': 'b'
    };

    // Mostrar retroalimentación guardada al cargar la página SI el cuestionario ya fue intentado
    const initialProgress = getTaskProgress(pageKey);
    if (initialProgress.quiz_attempted) {
        displayQuizFeedback(pageKey, quizCorrectAnswers);
    }

    quizForm.addEventListener('submit', function(event) {
        event.preventDefault(); 
        console.log('[DEBUG] Cuestionario enviado, recarga prevenida.');
        updateTaskStatusInStorage(pageKey, 'quiz_attempted', true);

        const formData = new FormData(quizForm);
        let score = 0;
        const totalQuestions = Object.keys(quizCorrectAnswers).length;
        
        const userSubmittedAnswers = {}; // Para guardar en localStorage

        for (const [questionName, correctAnswer] of Object.entries(quizCorrectAnswers)) {
            const userAnswer = formData.get(questionName);
            userSubmittedAnswers[questionName] = userAnswer; // Guardar respuesta actual
            if (userAnswer === correctAnswer) {
                score++;
            }
        }
        
        // Guardar respuestas del usuario junto con el progreso
        const currentProgress = getTaskProgress(pageKey);
        currentProgress.user_quiz_answers = userSubmittedAnswers; // Nueva propiedad
        localStorage.setItem(pageKey, JSON.stringify(currentProgress));

        // Para 2 preguntas, se necesitan 2 aciertos para el 100%
        const passed = (score === totalQuestions);
        updateTaskStatusInStorage(pageKey, 'quiz_passed', passed); // Esto llamará a calculateOverallProgress que llama a renderTaskStatus

        displayQuizFeedback(pageKey, quizCorrectAnswers); // Mostrar retroalimentación actualizada

        if (passed) {
            alert(`¡Cuestionario Aprobado! Puntaje: ${score}/${totalQuestions}`);
        } else {
            alert(`Cuestionario No Aprobado. Puntaje: ${score}/${totalQuestions}. Revisa las respuestas e intenta de nuevo.`);
        }
    });
    console.log('[DEBUG] Listener añadido a quizForm.');
} else {
    console.warn('[DEBUG] quizForm no encontrado, no se añade listener.');
}

// --- LLAMADA INICIAL AL FINAL --- 
console.log('[DEBUG] Llamando a calculateAndUpdateOverallProgress por primera vez al final de DOMContentLoaded.');
calculateAndUpdateOverallProgress(pageKey); // Esto ya renderiza los íconos de tarea 