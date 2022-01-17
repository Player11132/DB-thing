var oracledb = require('oracledb');
const port = 5000; // portul pe care sa ruleze aplicatia (localhost:5000)
const express = require("express");

// ca sa poti sa folosesti ejs-uri
const app = express();
app.set("view engine", "ejs");

// ca sa poti sa folosesti file-urile din folderul "public", acolo pui css-uri sau js-uri
app.use(express.static("public"));

// database configuration
oracledb.autoCommit = true;
var connectionProperties = {
    user: "your_username",
    password: "your_password",
    connectString: "193.226.51.37:1521/o11g"
};

function doRelease(connection) {
    connection.release(function (err) {
        if (err) {
            console.error(err.message);
        }
    });
};

// GET requests
app.get("/", function (req, res) {
    // te conectezi la baza de date
    oracledb.getConnection(connectionProperties, function (err, connection) {
        if (err) {
            // eroare la conectare
            console.error(err.message); // dai print in consola la mesajul de eroare
            response.status(500).send("Error connecting to DB");
            return;
        }

        console.log("After connection"); // print in consola "After connection"

        // definesti instructiunea sql (ce anume vrei sa iei din baza de date)
        var sql_query = "select * from employees"

        // executi comanda definita
        connection.execute(sql_query, {}, { outFormat: oracledb.OBJECT },
            function (error, result) {
                if (error) {
                    console.error(error.message);
                    response.status(500).send("Error getting data from DB");
                    doRelease(connection);
                    return;
                }
                
                // extragi informatiile din baza de date intr-un vector
                var employees = [];

                // parcurgi fiecare linie din rezultatul instructiunii sql pe care ai rulat-o
                // in cazul de fata fiecare linie pe rand din tabelul employees
                result.rows.forEach(function (element) {
        
                    // adaugi in vectorul tau cate un nou angajat
                    employees.push({
                        employee_id: element.EMPLOYEE_ID, // trb sa le scrii cu litere mari, cu litere mici nu afiseaza nimic
                        last_name: element.LAST_NAME,
                        first_name: element.FIRST_NAME,
                        salary: element.SALARY,
                        hire_date: element.HIRE_DATE,
                        department_id: element.DEPARTMENT_ID
                    });
                }, this);

                doRelease(connection);

                // am terminat de extras angajatii din employees
                console.log("Got employees data");

                // trimiti catre interfata angajatii
                // practic in pagina index.ejs, acum o sa ai acces la lista asta de employees
                // in interfata o sa poti sa te folosesti de ui_employees
                // prin {ui_employees: employees} spui ca ii dai valoarea employees lui ui_employees 
                // poti sa ai si {employees: employees}, dar al doilea employees e efectiv lista pe care
                // am construit-o mai sus.
                // o sa ai acces la vectorul asta doar in pagina index, daca iti faci alta pagina, cu alt nume
                // nu mai poti accesa vectorul
                res.render("html/index", { ui_employees: employees });
            });
    });
});

// pornesti aplicatia pe portul specificat la inceputul fisierului asta
app.listen(port, function(error) {
    if (error) {
        console.log("Something went wrong!", error);
    }
    else {
        console.log("Server is on port " + port);
    }
});