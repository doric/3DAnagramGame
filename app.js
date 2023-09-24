fetch('foodList.json')
  .then(response => response.json())
  .then(data => {
    // Liste d'aliments et leurs anagrammes
    const foodList = data;
	
    // Le reste de votre code JavaScript reste inchangé
    startAnagramGame(foodList);
  })
  .catch(error => console.error('Erreur lors du chargement du JSON :', error));


