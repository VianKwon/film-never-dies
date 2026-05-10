// Simple tests for film preservation



const FilmPreservation = require('../src/sample');



describe('FilmPreservation', () => {

  let preservation;



  beforeEach(() => {

    preservation = new FilmPreservation();

  });



  test('should start with empty film list', () => {

    expect(preservation.films).toEqual([]);

  });



  test('should add a film', () => {

    const film = preservation.addFilm('Test Film', 2020, '35mm', 'Good');

    

    expect(film).toHaveProperty('id', 1);

    expect(film).toHaveProperty('title', 'Test Film');

    expect(film).toHaveProperty('year', 2020);

    expect(film).toHaveProperty('type', '35mm');

    expect(film).toHaveProperty('condition', 'Good');

    expect(preservation.films).toHaveLength(1);

  });



  test('should get correct statistics', () => {

    preservation.addFilm('Film 1', 2000, '8mm', 'Good');

    preservation.addFilm('Film 2', 2010, '16mm', 'Fair');

    preservation.addFilm('Film 3', 2020, '35mm', 'Excellent');

    

    const stats = preservation.getStats();

    

    expect(stats.total).toBe(3);

    expect(stats.byType['8mm']).toBe(1);

    expect(stats.byType['16mm']).toBe(1);

    expect(stats.byType['35mm']).toBe(1);

    expect(stats.byCondition['Good']).toBe(1);

    expect(stats.byCondition['Fair']).toBe(1);

    expect(stats.byCondition['Excellent']).toBe(1);

  });



  test('should handle empty list in statistics', () => {

    const stats = preservation.getStats();

    

    expect(stats.total).toBe(0);

    expect(stats.byType).toEqual({});

    expect(stats.byCondition).toEqual({});

  });

});

