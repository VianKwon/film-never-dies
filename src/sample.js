// Film preservation tool - Sample module

class FilmPreservation {
  constructor() {
    this.films = [];
  }

  // Add a film reel
  addFilm(title, year, type, condition) {
    const film = {
      id: this.films.length + 1,
      title,
      year,
      type,
      condition,
      added: new Date().toISOString()
    };
    
    this.films.push(film);
    console.log(`Added: ${title} (${year}, ${type})`);
    return film;
  }

  // List all films
  listFilms() {
    console.log('\n🎞️ Film Collection:');
    console.log('==================');
    
    if (this.films.length === 0) {
      console.log('No films yet.');
      return;
    }

    this.films.forEach(film => {
      console.log(`\nID: ${film.id}`);
      console.log(`Title: ${film.title}`);
      console.log(`Year: ${film.year}`);
      console.log(`Type: ${film.type}`);
      console.log(`Condition: ${film.condition}`);
      console.log(`Added: ${new Date(film.added).toLocaleDateString()}`);
    });
  }

  // Get statistics
  getStats() {
    return {
      total: this.films.length,
      byType: this.films.reduce((acc, film) => {
        acc[film.type] = (acc[film.type] || 0) + 1;
        return acc;
      }, {}),
      byCondition: this.films.reduce((acc, film) => {
        acc[film.condition] = (acc[film.condition] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

// Example usage
if (require.main === module) {
  const preservation = new FilmPreservation();
  
  // Add sample films
  preservation.addFilm('Family Vacation', 1975, '8mm', 'Good');
  preservation.addFilm('Factory Documentary', 1982, '16mm', 'Fair');
  preservation.addFilm('City Scenes', 1990, '35mm', 'Excellent');
  
  // List films
  preservation.listFilms();
  
  // Show stats
  const stats = preservation.getStats();
  console.log('\n📊 Statistics:');
  console.log('=============');
  console.log(`Total films: ${stats.total}`);
  console.log('By type:', stats.byType);
  console.log('By condition:', stats.byCondition);
}

module.exports = FilmPreservation;

