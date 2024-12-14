const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");

const filePath = path.join(__dirname, "data/imdb_top_1000.csv");
const csvData = [];

fs.createReadStream(filePath)
  .pipe(parse({ delimiter: "," }))
  .on("data", (row) => csvData.push(row))
  .on("end", () => {
    // console.log(csvData);
  })
  .on("finish", readData)
  .on("error", (error) => {
    console.log(error.message);
  });

async function readData() {
  const fullLength = csvData.length;
  const testLength = 10;

  const _ = await truncate();

  for (let i = 1; i < testLength; i++) {
    const img_url = csvData[i][0];
    const title = csvData[i][1];
    const release_year = csvData[i][2];
    const certificate = csvData[i][3];
    const runtime = csvData[i][4];
    const genre = csvData[i][5];
    const imdb_score = csvData[i][6];
    const overview = csvData[i][7];
    const meta_score = csvData[i][8];
    const director = csvData[i][9];
    const cast_1 = csvData[i][10];
    const cast_2 = csvData[i][11];
    const cast_3 = csvData[i][12];
    const cast_4 = csvData[i][13];
    const num_of_votes = csvData[i][14];
    const gross = csvData[i][15];

    const runtimeInt = parseInt(runtime);
    const revenue = parseInt(gross.replace(/,/g, ""));
    const firstNameDirector = director.split(" ").slice(0, -1).join(" ");
    const lastNameDirector = director.split(" ").slice(-1).join(" ");

    const firstNameCast1 = cast_1.split(" ").slice(0, -1).join(" ");
    const lastNameCast1 = cast_1.split(" ").slice(-1).join(" ");

    const firstNameCast2 = cast_2.split(" ").slice(0, -1).join(" ");
    const lastNameCast2 = cast_2.split(" ").slice(-1).join(" ");

    const firstNameCast3 = cast_3.split(" ").slice(0, -1).join(" ");
    const lastNameCast3 = cast_3.split(" ").slice(-1).join(" ");

    const firstNameCast4 = cast_4.split(" ").slice(0, -1).join(" ");
    const lastNameCast4 = cast_4.split(" ").slice(-1).join(" ");

    let casts = [
      {
        first: firstNameCast1,
        last: lastNameCast1,
      },
      {
        first: firstNameCast2,
        last: lastNameCast2,
      },
      {
        first: firstNameCast3,
        last: lastNameCast3,
      },
      {
        first: firstNameCast4,
        last: lastNameCast4,
      },
    ];

    let imdbPuan = parseFloat(imdb_score) * 10;
    let metaPuan = meta_score;

    var genres = genre.split(", ");
    insertMovies(
      title,
      release_year,
      certificate,
      overview,
      runtimeInt,
      img_url,
      revenue,
      firstNameDirector,
      lastNameDirector,
      genres,
      imdbPuan,
      metaPuan,
      casts
    );
  }
}
