extern crate iron;
extern crate mount;
extern crate params;
extern crate persistent;
extern crate router;
extern crate staticfile;
extern crate postgres;
extern crate chrono;
extern crate url;
extern crate rustc_serialize;
extern crate getopts;

// Std
use std::env;
use std::path::Path;
use std::io::ErrorKind;
use std::fs;

// Iron
use iron::prelude::*;
use iron::headers;
use iron::status;
use iron::typemap::Key;

// Mount
use mount::Mount;

// Params
use params::{Params,Value};

// Persistent
use persistent::Write;

// Router
use router::Router;

// Static File
use staticfile::Static;

// Postgres
use postgres::{Connection, SslMode};
use postgres::error::*;

// Chrono
use chrono::*;

// URL
use url::percent_encoding::*;

// JSON
use rustc_serialize::json;

// Getopts
use getopts::Options;

#[derive(Copy, Clone)]
pub struct DatabaseConnection;

impl Key for DatabaseConnection { type Value = Connection; }

const GET_HOOPS_SQL: &'static str =
    "SELECT * FROM hoop";

const INSERT_HOOP_SQL: &'static str =
    "INSERT INTO hoop (name, description, image_url, latitude, longitude, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())";

const GET_USER_SQL: &'static str =
    "SELECT * FROM usr";

const GET_USER_BY_ID_SQL: &'static str =
    "SELECT * FROM usr WHERE id = $1 LIMIT 1";

const GET_USER_BY_HANDLE_SQL: &'static str =
    "SELECT * FROM usr WHERE email = $1 OR facebook_id = $2 OR twitter_id = $3 LIMIT 1";

const INSERT_USER_SQL: &'static str =
    "INSERT INTO usr (name, email, facebook_id, twitter_id, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     RETURNING id";

#[derive(RustcEncodable)]
struct Hoop {
    id: i64,
    name: String,
    description: String,
    image_url: String,
    latitude: f32,
    longitude: f32,
    created_at: String,
    updated_at: String,
}

#[derive(RustcEncodable)]
struct User {
    id: i64,
    name: String,
    email: String,
    facebook_id: String,
    twitter_id: String,
    created_at: DateTime<UTC>,
    updated_at: DateTime<UTC>,
}

fn get_hoops_handler(req: &mut Request) -> IronResult<Response> {
    // Get database handle
    let mutex = req.get::<Write<DatabaseConnection>>().unwrap();
    let conn = mutex.lock().unwrap();

    let mut hoops = Vec::new();

    for row in &conn.query(GET_HOOPS_SQL, &[]).unwrap() {
        let mut hoop = Hoop {
            id: row.get(0),
            name: row.get(1),
            description: row.get(2),
            image_url: row.get(3),
            latitude: row.get(4),
            longitude: row.get(5),
            created_at: "".to_string(),
            updated_at: "".to_string(),
        };

        let created_at: DateTime<UTC> = row.get(6);
        let updated_at: DateTime<UTC> = row.get(7);

        hoop.created_at = created_at.to_rfc2822();
        hoop.updated_at = updated_at.to_rfc2822();

        hoops.push(hoop);
    }

    if let Ok(json_output) = json::encode(&hoops) {
        let mut response = Response::with((iron::status::Ok, json_output));
        response.headers.set(headers::AccessControlAllowOrigin::Value("*".to_string()));
        return Ok(response);
    }

    Ok(Response::with((iron::status::InternalServerError)))
}

fn post_hoop_handler(req: &mut Request) -> IronResult<Response> {
    // Get database handle
    let mutex = req.get::<Write<DatabaseConnection>>().unwrap();
    let conn = mutex.lock().unwrap();

    let map = match req.get_ref::<Params>() {
        Ok(map) => map,
        Err(error) => {
            println!("{:?}", error);
            return Ok(Response::with((status::BadRequest)));
        },
    };

    let name = match map.find(&["name"]) {
        Some(&Value::String(ref val)) => val,
        _ => {
            return Ok(Response::with((status::BadRequest)));
        }
    };

    let description = match map.find(&["description"]) {
        Some(&Value::String(ref val)) => val,
        _ => {
            return Ok(Response::with((status::BadRequest)));
        }
    };

    let latitude = match map.find(&["latitude"]) {
        Some(&Value::String(ref val)) => {
            if let Ok(val) = val.parse::<f32>() {
                val
            } else {
                return Ok(Response::with((status::BadRequest)));
            }
        },
        _ => {
            return Ok(Response::with((status::BadRequest)));
        }
    };

    let longitude = match map.find(&["longitude"]) {
        Some(&Value::String(ref val)) => {
            if let Ok(val) = val.parse::<f32>() {
                val
            } else {
                return Ok(Response::with((status::BadRequest)));
            }
        },
        _ => {
            return Ok(Response::with((status::BadRequest)));
        }
    };

    // Check if hoop with existing name already exists
    for row in &conn.query("SELECT COUNT(*) FROM hoop WHERE name LIKE $1", &[name]).unwrap() {
        let count = row.get::<usize, i64>(0);
        if count > 0 {
            return Ok(Response::with((status::BadRequest, "Hoop with the same name already exists")));
        }
    }

    let image_url = match map.find(&["file"]) {
        Some(&Value::File(ref file)) => {
            // Check file size
            if file.size() > 10 * 1024 * 1024 {
                return Ok(Response::with(status::PayloadTooLarge));
            }

            // Create content directory
            if let Err(error) = fs::create_dir("content") {
                if error.kind() != ErrorKind::AlreadyExists {
                    return Ok(Response::with((status::BadRequest)));
                }
            }

            let filename = match file.path().file_name() {
                Some(filename) => match filename.to_str() {
                    Some(filename) => filename,
                    _ => return Ok(Response::with((status::BadRequest))),
                },
                _ => return Ok(Response::with((status::BadRequest))),
            };

            let dst = format!("content/{}", filename);
            if let Err(error) = fs::copy(file.path(), &dst) {
                println!("{:?}", error);
                return Ok(Response::with((status::InternalServerError)));
            }

            dst
        },
        _ => {
            match map.find(&["image-url"]) {
                Some(&Value::String(ref val)) => val.clone(),
                _ => {
                    return Ok(Response::with((status::BadRequest)));
                }
            }
        }
    };

    // Insert hoop
    if let Err(error) = conn.execute(INSERT_HOOP_SQL, &[&name, &description, &image_url, &latitude, &longitude]) {
        // Clean-up the image file since it failed to register on the database
        if let Err(error) = fs::remove_file(image_url) {
            println!("{:?}", error);
        }

        println!("{:?}", error);
        return Ok(Response::with((status::InternalServerError)));
    }

    Ok(Response::with((status::Ok)))
}

fn get_user_handler(req: &mut Request) -> IronResult<Response> {
    // Get database handle
    let mutex = req.get::<Write<DatabaseConnection>>().unwrap();
    let conn = mutex.lock().unwrap();

    for row in &conn.query(GET_USER_SQL, &[]).unwrap() {
        let user = User {
            id: row.get(0),
            name: row.get(1),
            email: row.get(2),
            facebook_id: row.get(3),
            twitter_id: row.get(4),
            created_at: row.get(5),
            updated_at: row.get(6),
        };

        if let Ok(json_output) = json::encode(&user) {
            let mut response = Response::with((iron::status::Ok, json_output));
            response.headers.set(headers::AccessControlAllowOrigin::Value("*".to_string()));
            return Ok(response);
        }
    }

    Ok(Response::with((iron::status::NotFound)))
}

fn post_user_handler(req: &mut Request) -> IronResult<Response> {
    // Get database handle
    let mutex = req.get::<Write<DatabaseConnection>>().unwrap();
    let conn = mutex.lock().unwrap();

    let map = match req.get_ref::<Params>() {
        Ok(map) => map,
        Err(error) => {
            println!("{:?}", error);
            return Ok(Response::with((status::BadRequest)));
        },
    };

    let name = match map.find(&["name"]) {
        Some(&Value::String(ref val)) => val,
        _ => return Ok(Response::with((status::BadRequest))),
    };

    let ref empty_string = "".to_string();

    let email = match map.find(&["email"]) {
        Some(&Value::String(ref val)) => val,
        _ => { empty_string }
    };

    let facebook_id = match map.find(&["facebook_id"]) {
        Some(&Value::String(ref val)) => val,
        _ => { empty_string }
    };

    let twitter_id = match map.find(&["twitter_id"]) {
        Some(&Value::String(ref val)) => val,
        _ => { empty_string }
    };

    // There's no way for user to sign up without email, facebook_id, or twitter_id
    if email == empty_string && facebook_id == empty_string && twitter_id == empty_string {
        return Ok(Response::with((status::BadRequest)));
    }

    // Get user if exists
    match conn.query(GET_USER_BY_HANDLE_SQL, &[&email, &facebook_id, &twitter_id]) {
        Ok(ref rows) => {
            if rows.len() > 0 {
                let row = rows.iter().next().unwrap();
                let user = User {
                    id: row.get(0),
                    name: row.get(1),
                    email: row.get(2),
                    facebook_id: row.get(3),
                    twitter_id: row.get(4),
                    created_at: row.get(5),
                    updated_at: row.get(6),
                };

                if let Ok(json_output) = json::encode(&user) {
                    let mut response = Response::with((iron::status::Ok, json_output));
                    response.headers.set(headers::AccessControlAllowOrigin::Value("*".to_string()));
                    return Ok(response);
                }
            }
        },
        Err(error) => {
            println!("{:?}", error);
            return Ok(Response::with((status::InternalServerError)));
        },
    }

    // Insert user
    match conn.query(INSERT_USER_SQL, &[&name, &email, &facebook_id, &twitter_id]) {
        Ok(ref rows) => {
            let id: i64 = rows.iter().next().unwrap().get(0);
            match conn.query(GET_USER_BY_ID_SQL, &[&id]) {
                Ok(rows) => {
                    let row = rows.iter().next().unwrap();
                    let user = User {
                        id: row.get(0),
                        name: row.get(1),
                        email: row.get(2),
                        facebook_id: row.get(3),
                        twitter_id: row.get(4),
                        created_at: row.get(5),
                        updated_at: row.get(6),
                    };

                    if let Ok(json_output) = json::encode(&user) {
                        let mut response = Response::with((iron::status::Ok, json_output));
                        response.headers.set(headers::AccessControlAllowOrigin::Value("*".to_string()));
                        return Ok(response);
                    }
                },
                Err(error) => println!("{:?}", error),
            }
        },
        Err(error) => println!("{:?}", error),
    }

    Ok(Response::with((status::InternalServerError)))
}

fn print_usage(program: &str, opts: Options) {
    let brief = format!("Usage: {} [options]", program);
    print!("{}", opts.usage(&brief));
}

fn main() {
    // Parse program arguments
    let args: Vec<String> = env::args().collect();
    let program = args[0].clone();

    let mut opts = Options::new();
    opts.optopt("",
                "dbhost",
                "set database host",
                "DBHOST");
    opts.optopt("",
                "dbport",
                "set database port",
                "DBPORT");
    opts.optopt("",
                "dbuser",
                "set database username",
                "DBUSER");
    opts.optopt("",
                "dbpass",
                "set database password",
                "DBPASS");
    opts.optopt("",
                "host",
                "set server host",
                "HOST");
    opts.optopt("",
                "port",
                "set server port",
                "PORT");
    opts.optflag("", "serve-site", "");
    opts.optflag("h", "help", "print this help menu");

    let matches = match opts.parse(&args[1..]) {
        Ok(m) => m,
        Err(f) => panic!(f.to_string()),
    };
    if matches.opt_present("h") {
        print_usage(&program, opts);
        return;
    }

    let dbhost: String = match matches.opt_str("dbhost") {
        Some(t) => t,
        None => "localhost".to_string(),
    };

    let dbport: String = match matches.opt_str("dbport") {
        Some(t) => t,
        None => "5432".to_string(),
    };

    let dbuser: String = match matches.opt_str("dbuser") {
        Some(t) => percent_encode(t.as_bytes(), FORM_URLENCODED_ENCODE_SET),
        None => "postgres".to_string(),
    };

    let dbpass: String = match matches.opt_str("dbpass") {
        Some(t) => format!(":{}", percent_encode(t.as_bytes(), FORM_URLENCODED_ENCODE_SET)),
        None => "".to_string(),
    };

    let conn = Connection::connect(format!("postgres://{}{}@{}:{}", dbuser, dbpass, dbhost, dbport).as_str(), SslMode::None).unwrap();

    // Create Hoop table
    if let Err(error) = conn.execute(
        "CREATE TABLE hoop (
             id              BIGSERIAL PRIMARY KEY,
             name            VARCHAR NOT NULL,
             description     VARCHAR NOT NULL,
             image_url       VARCHAR NOT NULL,
             latitude        REAL NOT NULL,
             longitude       REAL NOT NULL,
             created_by      BIGSERIAL NOT NULL,
             created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
             updated_at      TIMESTAMP WITH TIME ZONE NOT NULL,
             UNIQUE (id, name)
         )", &[])
    {
        if let Error::Db(error) = error {
            if error.code != SqlState::DuplicateTable {
                println!("{:?}", error);
                return;
            }
        }
    }

    // Create User table
    if let Err(error) = conn.execute(
        "CREATE TABLE usr (
             id              BIGSERIAL PRIMARY KEY,
             name            VARCHAR NOT NULL,
             email           VARCHAR,
             facebook_id     VARCHAR,
             twitter_id      VARCHAR,
             created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
             updated_at      TIMESTAMP WITH TIME ZONE NOT NULL,
             UNIQUE (id, email, facebook_id, twitter_id)
         )", &[])
    {
        if let Error::Db(error) = error {
            if error.code != SqlState::DuplicateTable {
                println!("{:?}", error);
                return;
            }
        }
    }

    let mut router = Router::new();
    router.get("/hoops", get_hoops_handler);
    router.post("/hoop", post_hoop_handler);
    router.get("/user", get_user_handler);
    router.post("/user", post_user_handler);

    let mut mount = Mount::new();
    if matches.opt_present("serve-site") {
        mount.mount("/", Static::new(Path::new("public")));
        mount.mount("/content", Static::new(Path::new("content")));
    }
    mount.mount("/api", router);

    let mut chain = Chain::new(mount);
    chain.link(Write::<DatabaseConnection>::both(conn));

    let host: String = match matches.opt_str("host") {
        Some(t) => t,
        None => "localhost".to_string(),
    };

    let port: String = match matches.opt_str("port") {
        Some(t) => t,
        None => "8080".to_string(),
    };

    let address = format!("{}:{}", host, port);
    println!("Serving at {}", address);

    Iron::new(chain).http(address.as_str()).unwrap();
}
