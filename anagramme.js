/**
 * Le code fourni semble être une fonction JavaScript nommée startAnagramGame. Cette fonction semble mettre en place un jeu d'anagrammes sur le Web dans lequel les joueurs déchiffrent des mots liés à la nourriture. Il utilise la bibliothèque Three.js pour les graphiques 3D et permet aux joueurs d'interagir avec les anagrammes en cliquant sur les lettres. Vous trouverez ci-dessous un aperçu des fonctionnalités et composants clés du code :
 *
 * Initialisation :
 *
 * La fonction prend un paramètre foodList, qui est un tableau d'objets liés à l'alimentation comprenant des anagrammes et d'autres propriétés.
 * Il définit diverses variables et constantes, notamment le nombre de tentatives autorisées (maxAttempts), les sons et les éléments de la scène.
 * Graphiques 3D :
 *
 * Le code utilise Three.js pour créer une scène 3D pour le rendu du jeu.
 * Il charge une police pour restituer le texte en 3D et initialise le jeu avec la police chargée.
 * Il crée un maillage 3D pour afficher le texte de l'anagramme et gère les interactions telles que le double-clic et le clic sur les lettres.
 * Logique du jeu :
 *
 * La logique du jeu inclut la gestion des interactions des joueurs, comme cliquer sur les lettres et double-cliquer sur la bonne réponse.
 * Il suit le score du joueur et le met à jour en conséquence.
 * Il permet aux joueurs de passer à l'anagramme suivant une fois résolu ou de révéler la réponse après un certain nombre de tentatives.
 * Carrousel d'arrière-plan :
 *
 * Le code inclut des fonctions permettant de créer un carrousel d'arrière-plan à l'aide d'images provenant d'un répertoire spécifié.
 * L'audio:
 *
 * Il initialise l'audio pour les clics sur les boutons et les sons de réussite.
 * Il lit des fichiers audio aléatoires à partir d'un répertoire et planifie la prochaine lecture audio après une durée fixe.
 * Écouteurs d'événements :
 *
 * Les écouteurs d'événements sont configurés pour divers éléments, tels que les boutons, le redimensionnement des fenêtres et les entrées de l'utilisateur pour deviner les réponses.
 * Fonctionnalité des boutons :
 *
 * Des boutons tels que « Afficher la réponse » et « Anagramme suivant » disposent d'écouteurs d'événements pour déclencher des actions dans le jeu, telles que révéler la réponse ou passer au mot suivant.
 * La gestion des erreurs:
 *
 * Il existe des mécanismes de gestion des erreurs pour récupérer les fichiers des répertoires.
 * Manipulation du DOM :
 *
 * Le code manipule le DOM pour mettre à jour l'affichage des boutons, des scores et des descriptions.
 * Flux global :
 *
 * Le jeu démarre lorsqu'un bouton "Démarrer" est cliqué.
 * Les joueurs déchiffrent les mots liés à la nourriture en cliquant sur les lettres.
 * Ils peuvent révéler la réponse ou passer à l’anagramme suivante s’ils le souhaitent.
 * Veuillez noter que ce code est conçu pour être utilisé dans un environnement Web et suppose que vous disposez des éléments HTML et CSS nécessaires configurés pour fonctionner avec lui. De plus, il existe des références à des ressources externes telles que des polices, des fichiers audio et des chemins d'images, qui doivent être configurées de manière appropriée dans votre projet.
 * [startAnagramGame Fonction pour démarrer le jeu d'anagramme]
 * @param foodList
 */
function startAnagramGame(foodList) {
    let attempts = 0; // Compteur d'échecs
    const maxAttempts = 3; // Nombre maximum d'échecs avant de montrer la réponse

    const showAnswerButton = document.getElementById('showAnswerButton');
    const nextAnagramButton = document.getElementById('nextAnagramButton');

    // Sélectionnez un aliment aléatoire pour commencer le jeu
    const randomIndex = Math.floor(Math.random() * foodList.length);
    let currentFoodIndex = randomIndex;

    let randomFood = foodList[currentFoodIndex];

    const clickSound = new Howl({ src: ['click.mp3'] });
    const successSound = new Howl({ src: ['success.mp3'] });
	// Récupérez l'élément DOM pour afficher la description
	const descriptionElement = document.getElementById('foodDescription');

    let isSolved = false;
    let score = 0;
    let selectedLetter = null;
    let textMesh;
	let backgroundCube;
	// Répertoire contenant les fichiers audio
	const directoryPath = './audios'; // Remplacez par le chemin de votre répertoire audio

	// Liste des extensions de fichiers audio supportées
	const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac']; // Ajoutez d'autres extensions si nécessaire

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    let usedWords = [];
    let initialFoodList = foodList;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0xffffff); 
    document.getElementById('scene-container').appendChild(renderer.domElement);

    const fontLoader = new THREE.FontLoader();

    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
        initializeGame(font);
        animate();
    });

	// Fonction pour récupérer la liste des noms de fichiers dans le dossier "photos"
	async function getPhotoFileNames() {
	  const response = await fetch('/photos/');
	  const data = await response.text();
	  const parser = new DOMParser();
	  const xmlDoc = parser.parseFromString(data, 'text/html');
	  const fileNodes = xmlDoc.querySelectorAll('a');

	  const fileNames = [];
	  fileNodes.forEach((node) => {
		const fileName = node.textContent;
		// Filtrer uniquement les fichiers d'images par extension (par exemple, .jpg, .png, .jpeg, .gif, etc.)
		if (/\.(jpg|jpeg|png|gif)$/i.test(fileName)) {
			fileNames.push(`./photos/${fileName}`);
		}
	  });
	  return fileNames;
	}

	// Inside the createBackgroundCarousel function
	function createBackgroundCarousel(imagePaths) {
		const loader = new THREE.TextureLoader();
		const textures = [];

		for (let i = 0; i < imagePaths.length; i++) {
			const texture = loader.load(imagePaths[i]);
			texture.generateMipmaps = true;
			textures.push(texture);
		}

		const backgroundTexture = new THREE.CubeTexture(textures);
		const backgroundMaterial = new THREE.MeshBasicMaterial({ envMap: backgroundTexture });
		const backgroundGeometry = new THREE.BoxGeometry(100, 100, 100); // Adjust the size as needed
		let backgroundCube = new THREE.Mesh(backgroundGeometry, backgroundMaterial);

		// Set the cube's position and rotation
		backgroundCube.position.set(0, 0, 0); // Adjust the position as needed
		backgroundCube.rotation.set(0, Math.PI, 0);

		scene.add(backgroundCube); // Add the cube to the scene
	}

    // Fonction pour permuter aléatoirement deux caractères dans une chaîne
    function shuffleString(input) {
        const characters = input.split('');
        for (let i = characters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [characters[i], characters[j]] = [characters[j], characters[i]];
        }
        return characters.join('');
    }


    function initializeGame(font) {
        randomFood.anagram = shuffleString(randomFood.anagram);
        textMesh = createTextMesh(randomFood.anagram, font);
		textMesh.position.set(-2.5, -0.5, 0);
        scene.add(textMesh);

        textMesh.addEventListener('dblclick', handleDoubleClick);
        textMesh.children.forEach((letterMesh) => {
            letterMesh.addEventListener('mousemove', handleLetterClick);
        });

        const titleMesh = createTextMesh("Jeu d'Anagramme Culinaire", font, 0.3);
        titleMesh.position.set(-2.5, 2, 0);
        scene.add(titleMesh);

        // Ajoutez cette ligne pour masquer le bouton "Montrer la réponse" au début du jeu
        showAnswerButton.style.display = 'none';
    }


    // Fonction pour gérer l'affichage des boutons
    function updateButtons() {
        if (attempts >= maxAttempts) {
            showAnswerButton.style.display = 'block'; // Afficher le bouton "Montrer la réponse"
        } else {
            showAnswerButton.style.display = 'none'; // Cacher le bouton "Montrer la réponse"
        }
        if (isSolved) {
            nextAnagramButton.style.display = 'block';
            showAnswerButton.style.display = 'none';
        } else {
            nextAnagramButton.style.display = 'none';
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    function handleDoubleClick() {
        if (!isSolved && randomFood.anagram === randomFood.name) {
            isSolved = true;
            successSound.play();
            score += 10;
            document.getElementById('score').textContent = score;
            setTimeout(nextWord, 2000);
        }
    }

    function handleLetterClick() {
        if (!isSolved) {
            if (selectedLetter === null) {
                selectedLetter = this;
                selectedLetter.material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
            } else if (selectedLetter !== this) {
                const indexA = textMesh.children.indexOf(selectedLetter);
                const indexB = textMesh.children.indexOf(this);
                randomFood.anagram = swapLetters(randomFood.anagram, indexA, indexB);
				scene.remove(textMesh);
				textMesh = createTextMesh(randomFood.anagram, textMesh.font);
				textMesh.position.set(-2.5, -0.5, 0);
				scene.add(textMesh);
                selectedLetter.material = new THREE.MeshBasicMaterial({ color: 0xff5722 });
                selectedLetter = null;
                clickSound.play();
            }
        }
    }

    function createTextMesh(text, font, size = 0.5) {
        const textGeometry = createTextGeometry(text, font, size);
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xff5722 });
        const mesh = new THREE.Mesh(textGeometry, textMaterial);
        mesh.font = font;
        return mesh;
    }

    function createTextGeometry(text, font, size) {
        return new THREE.TextGeometry(text, {
            font: font,
            size: size,
            height: 0.05,
        });
    }

    function swapLetters(text, indexA, indexB) {
        const letters = text.split('');
        [letters[indexA], letters[indexB]] = [letters[indexB], letters[indexA]];
        return letters.join('');
    }

    function nextWord() {
        scene.remove(textMesh);
        if (foodList.length === 0) {
            descriptionElement.textContent = 'Aucun mot restant dans la liste.';
            foodList = initialFoodList;
            usedWords = []; // Réinitialisez usedWords si nécessaire.
            return;
        }

        // Créez une liste de mots non utilisés
        const unusedWords = foodList.filter(food => !usedWords.some(usedFood => usedFood.name === food.name));
        if (unusedWords.length === 0) {
            // Affichez un message dans descriptionElement lorsque tous les mots ont été utilisés.
            descriptionElement.textContent = 'Tous les mots ont été utilisés.';
            usedWords = []; // Réinitialisez usedWords si nécessaire.
            return;
        }

        const randomIndex = Math.floor(Math.random() * foodList.length);
        randomFood = foodList[randomIndex];

        selectedLetter = null;
        isSolved = false;

        randomFood.anagram = shuffleString(randomFood.anagram);
        textMesh = createTextMesh(randomFood.anagram, textMesh.font);
		textMesh.position.set(-2.5, -0.5, 0);
        scene.add(textMesh);

        // Affichez un message dans descriptionElement pour indiquer le nouveau mot.
        descriptionElement.textContent = 'Nouveau mot : ' + randomFood.anagram;
        descriptionElement.style.display = 'block';
    }

    function handleWindowResize() {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    }

    function initializeAudio() {
        const startButton = document.getElementById('startButton');
        startButton.addEventListener('click', () => {
            clickSound.play();
            successSound.play();
			refreshSceneWithCube();
			// Appelez la fonction pour obtenir la liste des noms de fichiers
			getPhotoFileNames().then((fileNames) => {
			  // Utilisez la liste des noms de fichiers pour créer votre carrousel de photos
			  createBackgroundCarousel(fileNames);
			});
			
			// Appel de la fonction pour obtenir la liste des noms de fichiers audio
			getAudioFileNames()
			.then((audioFiles) => {
				console.log('Audio files:', audioFiles);
				if (audioFiles.length > 0) {
					playRandomAudio(audioFiles);
				}
			})
			.catch((error) => {
				console.error('Error:', error);
			});
            startButton.remove();
        });
    }

    function handleGuess(event) {
        if (event.key === 'Enter') {
            const guessInput = document.getElementById('guessInput');
            const guess = guessInput.value.trim().toLowerCase();
            if (guess === randomFood.name.toLowerCase()) {
                isSolved = true;
                successSound.play();
                score += 10;
                document.getElementById('score').textContent = score;
                guessInput.value = '';
                nextWord();
            } else {
                attempts++;
                clickSound.play();
                updateButtons();
            }
        }
    }
	
	function createBackgroundCube(imagePaths) {
		const loader = new THREE.TextureLoader();
		const textures = [];

		for (let i = 0; i < imagePaths.length; i++) {
			const texture = loader.load(imagePaths[i]);
			texture.generateMipmaps = true;
			textures.push(texture);
		}

		const backgroundTexture = new THREE.CubeTexture(textures);
		const backgroundMaterial = new THREE.MeshBasicMaterial({ envMap: backgroundTexture });
		const backgroundGeometry = new THREE.BoxGeometry(100, 100, 100); // Adjust the size as needed
		const cube = new THREE.Mesh(backgroundGeometry, backgroundMaterial);

		// Set the cube's position and rotation
		cube.position.set(0, 0, 0); // Adjust the position as needed
		cube.rotation.set(0, Math.PI, 0);

		return cube;
	}

	
	function refreshSceneWithCube() {
		// Remove the existing cube from the scene
		scene.remove(backgroundCube);

		// Appelez la fonction pour obtenir la liste des noms de fichiers
		getPhotoFileNames().then((fileNames) => {
		  // Utilisez la liste des noms de fichiers pour créer votre carrousel de photos
		  createBackgroundCarousel(fileNames);
		});
	}

	// Fonction pour jouer un fichier audio aléatoire
    function playRandomAudio(audioFiles) {
        if (audioFiles.length === 0) {
            console.log('Aucun fichier audio trouvé dans le répertoire.');
            return;
        }

        const randomIndex = Math.floor(Math.random() * audioFiles.length);
        const randomAudio = new Audio(audioFiles[randomIndex]);

        randomAudio.play();

        // Planifiez la prochaine lecture audio après 1 minute (60000 millisecondes)
        setTimeout(() => playRandomAudio(audioFiles), 60000);
    }


	// Fonction pour vérifier si un fichier a une extension audio
	function isAudioFile(filename) {
	  const ext = path.extname(filename).toLowerCase();
	  return audioExtensions.includes(ext);
	}

	// Fonction pour parcourir le répertoire et détecter les fichiers audio
	async function getAudioFileNames() {
        try {
            const response = await fetch(directoryPath);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'text/html');
            const fileNodes = xmlDoc.querySelectorAll('a');

            const audioFileNames = [];
            fileNodes.forEach((node) => {
                const fileName = node.textContent;
                if (audioExtensions.some(ext => fileName.endsWith(ext))) {
                    audioFileNames.push(`./audios/${fileName}`);
                }
            });

            return audioFileNames;
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    }

    // Ajoutez un gestionnaire d'événement pour le bouton "Montrer la réponse"
	showAnswerButton.addEventListener('click', () => {
		attempts = 0;
		updateButtons();
		scene.remove(textMesh);
		textMesh = createTextMesh(randomFood.name, textMesh.font);
		textMesh.position.set(-2.5, -0.5, 0);
		scene.add(textMesh);
		descriptionElement.textContent = randomFood.description; // Afficher la description
		descriptionElement.style.display = 'block'; // Afficher l'élément de description
		nextAnagramButton.style.display = 'block';
	});

	// Ajoutez un gestionnaire d'événement pour le bouton "Passer au prochain anagramme"
	nextAnagramButton.addEventListener('click', () => {
		nextWord();
		attempts = 0; // Réinitialisez le compteur d'échecs
		updateButtons(); // Mettez à jour l'affichage des boutons
		descriptionElement.style.display = 'none'; // Cacher l'élément de description
	});
    window.addEventListener('load', initializeAudio);
    window.addEventListener('resize', handleWindowResize);
    document.getElementById('guessInput').addEventListener('keydown', handleGuess);

    // Appelez updateButtons pour initialiser l'état des boutons
    updateButtons();
}
