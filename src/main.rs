extern crate iron;
extern crate cookie;
extern crate mount;
extern crate params;
extern crate persistent;
extern crate router;
extern crate staticfile;
extern crate postgres;
extern crate time;
extern crate chrono;
extern crate url;
extern crate rustc_serialize;
extern crate getopts;
extern crate openssl;

mod db;
mod activity;

// Std
use std::env;
use std::path::Path;
use std::io::ErrorKind;
use std::fs;
use std::str;

// Iron
use iron::prelude::*;
use iron::headers;
use iron::status;
use iron::typemap::Key;

// Cookie
use cookie::Cookie;

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

// OpenSSL
use openssl::crypto::hmac::hmac;
use openssl::crypto::hash::Type::SHA1;

#[derive(Copy, Clone)]
pub struct DatabaseConnection;

impl Key for DatabaseConnection { type Value = Connection; }

const SESSION_KEY: &'static str = "VdN9ndIQ2L0cNa6v0e6e5Q==";
const SESSION_DURATION_HOURS: i64 = 2;

#[derive(RustcEncodable)]
struct User {
    id: i64,
    name: String,
    email: Option<String>,
    facebook_id: Option<String>,
    twitter_id: Option<String>,
    image_url: Option<String>,
    created_at: DateTime<UTC>,
    updated_at: DateTime<UTC>,
}

#[derive(RustcEncodable)]
struct Story {
    id: i64,
    user_id: i64,
    name: String,
    description: String,
    image_url: String,
    created_at: String,
    updated_at: String,
}

#[derive(RustcEncodable)]
struct Hoop {
    id: i64,
    user_id: i64,
    name: String,
    description: String,
    latitude: f32,
    longitude: f32,
    created_at: String,
    updated_at: String,
}

fn get_hoops_handler(req: &mut Request) -> IronResult<Response> {
    // Get database handle
    let mutex = req.get::<Write<DatabaseConnection>>().unwrap();
    let conn = mutex.lock().unwrap();

    let mut hoops = Vec::new();

    #[derive(RustcEncodable)]
    struct HoopAndStories {
        hoop: Hoop,
        stories: Vec<Story>,
    }

    for row in &conn.query(db::GET_HOOPS_SQL, &[]).unwrap() {
        let mut hoop = HoopAndStories {
            hoop: Hoop {
                id: row.get(0),
                user_id: row.get(1),
                name: row.get(2),
                description: row.get(3),
                latitude: row.get(4),
                longitude: row.get(5),
                created_at: "".to_string(),
                updated_at: "".to_string(),
            },
            stories: Vec::new(),
        };

        for row in &conn.query(db::GET_STORIES_SQL, &[&hoop.hoop.id]).unwrap() {
            let mut story = Story {
                id: row.get(0),
                user_id: row.get(1),
                name: row.get(2),
                description: row.get(3),
                image_url: row.get(4),
                created_at: "".to_string(),
                updated_at: "".to_string(),
            };

            let created_at: DateTime<UTC> = row.get(5);
            let updated_at: DateTime<UTC> = row.get(6);

            story.created_at = created_at.to_rfc2822();
            story.updated_at = updated_at.to_rfc2822();
            hoop.stories.push(story);
        }

        let created_at: DateTime<UTC> = row.get(6);
        let updated_at: DateTime<UTC> = row.get(7);

        hoop.hoop.created_at = created_at.to_rfc2822();
        hoop.hoop.updated_at = updated_at.to_rfc2822();
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
    let (ok, user_id) = is_logged_in(req);
    if !ok {
        return Ok(Response::with((status::Forbidden)));
    }

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
    for row in &conn.query(db::COUNT_HOOP_BY_NAME_SQL, &[name]).unwrap() {
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

    let tx = conn.transaction().unwrap();

    // Insert story
    let story_id = match tx.query(db::INSERT_STORY_SQL, &[&user_id, &name, &description, &image_url]) {
        Ok(ref rows) => { let id: i64 = rows.iter().next().unwrap().get(0); id },
        Err(error) => {
            // Clean-up the image file since it failed to register on the database
            if let Err(error) = fs::remove_file(image_url) {
                println!("{:?}", error);
            }

            println!("insert story: {:?}", error);
            return Ok(Response::with((status::InternalServerError)))
        },
    };

    // Insert hoop
    let hoop_id = match tx.query(db::INSERT_HOOP_SQL, &[&user_id, &name, &description, &latitude, &longitude]) {
        Ok(ref rows) => { let id: i64 = rows.iter().next().unwrap().get(0); id },
        Err(error) => {
            // Clean-up the image file since it failed to register on the database
            if let Err(error) = fs::remove_file(image_url) {
                println!("{:?}", error);
            }

            println!("insert hoop: {:?}", error);
            return Ok(Response::with((status::InternalServerError)))
        },
    };

    // Insert Hoop-Story 
    if let Err(error) = tx.execute(db::INSERT_HOOP_STORY_SQL, &[&hoop_id, &story_id]) {
        // Clean-up the image file since it failed to register on the database
        if let Err(error) = fs::remove_file(image_url) {
            println!("insert hoop-story: {:?}", error);
        }

        println!("insert hoop-story: {:?}", error);
        return Ok(Response::with((status::InternalServerError)))
    }

    // Insert Hoop-Featured-Story
    if let Err(error) = tx.execute(db::INSERT_HOOP_FEATURED_STORY_SQL, &[&hoop_id, &story_id]) {
        // Clean-up the image file since it failed to register on the database
        if let Err(error) = fs::remove_file(image_url) {
            println!("insert hoop-featured-story {:?}", error);
        }

        println!("insert hoop-featured-story: {:?}", error);
        return Ok(Response::with((status::InternalServerError)))
    }

    // Insert activity
    let activity_type = activity::Type::AddHoop as i64;
    if let Err(error) = tx.execute(db::INSERT_ACTIVITY_WITH_HOOP_SQL, &[&activity_type, &user_id, &hoop_id]) {
        // Clean-up the image file since it failed to register on the database
        if let Err(error) = fs::remove_file(image_url) {
            println!("{:?}", error);
        }

        println!("insert activity: {:?}", error);
        return Ok(Response::with((status::InternalServerError)))
    }

    tx.commit().unwrap();

    Ok(Response::with((status::Ok)))
}

fn delete_hoop_handler(req: &mut Request) -> IronResult<Response> {
    let (ok, user_id) = is_logged_in(req);
    if !ok {
        return Ok(Response::with((status::Forbidden)));
    }

    // Get database handle
    let mutex = req.get::<Write<DatabaseConnection>>().unwrap();
    let conn = mutex.lock().unwrap();

    let map = match req.get_ref::<Params>() {
        Ok(map) => map,
        Err(_) => return Ok(Response::with((status::BadRequest))),
    };

    let hoop_id = match map.find(&["id"]) {
        Some(&Value::String(ref val)) => {
            match val.parse::<i64>() {
                Ok(id) => id,
                Err(_) => return Ok(Response::with((status::BadRequest))),
            }
        },
        _ => return Ok(Response::with((status::BadRequest))),
    };

    for row in &conn.query(db::GET_HOOP_USER_ID_SQL, &[&hoop_id]).unwrap() {
        let created_by: i64 = row.get(0);
        if user_id != created_by {
            return Ok(Response::with((status::Forbidden)));
        }
        break;
    }

    match conn.query(db::DELETE_HOOP_BY_ID_SQL, &[&hoop_id]) {
        Ok(_) => return Ok(Response::with((status::Ok))),
        Err(error) => println!("{:?}", error),
    }

    Ok(Response::with((status::InternalServerError)))
}

fn get_user_handler(req: &mut Request) -> IronResult<Response> {
    // Get database handle
    let mutex = req.get::<Write<DatabaseConnection>>().unwrap();
    let conn = mutex.lock().unwrap();

    let map = match req.get_ref::<Params>() {
        Ok(map) => map,
        Err(_) => return Ok(Response::with((status::BadRequest))),
    };

    let user_id = match map.find(&["id"]) {
        Some(&Value::String(ref val)) => {
            match val.parse::<i64>() {
                Ok(id) => id,
                Err(_) => return Ok(Response::with((status::BadRequest))),
            }
        },
        _ => return Ok(Response::with((status::BadRequest))),
    };

    for row in &conn.query(db::GET_USER_BY_ID_SQL, &[&user_id]).unwrap() {
        let user = User {
            id: row.get(0),
            name: row.get(1),
            email: row.get(2),
            facebook_id: row.get(3),
            twitter_id: row.get(4),
            image_url: row.get(5),
            created_at: row.get(6),
            updated_at: row.get(7),
        };

        if let Ok(json_output) = json::encode(&user) {
            let mut response = Response::with((iron::status::Ok, json_output));
            response.headers.set(headers::AccessControlAllowOrigin::Value("*".to_string()));
            return Ok(response);
        }
    }

    Ok(Response::with((iron::status::NotFound)))
}

fn get_login_handler(req: &mut Request) -> IronResult<Response> {
    let (ok, _) = is_logged_in(req);
    if ok {
        Ok(Response::with((status::Ok)))
    } else {
        Ok(Response::with((status::Forbidden)))
    }
}

fn post_login_handler(req: &mut Request) -> IronResult<Response> {
    // Get database handle
    let mutex = req.get::<Write<DatabaseConnection>>().unwrap();
    let conn = mutex.lock().unwrap();

    let (ok, user_id) = is_logged_in(req);
    if ok {
        match conn.query(db::GET_USER_BY_ID_SQL, &[&user_id]) {
            Ok(rows) => {
                let row = rows.iter().next().unwrap();
                let user = User {
                    id: row.get(0),
                    name: row.get(1),
                    email: row.get(2),
                    facebook_id: row.get(3),
                    twitter_id: row.get(4),
                    image_url: row.get(5),
                    created_at: row.get(6),
                    updated_at: row.get(7),
                };

                if let Ok(json_output) = json::encode(&user) {
                    let mut response = Response::with((iron::status::Ok, json_output));
                    let expire_time = time::now() + time::Duration::hours(SESSION_DURATION_HOURS);
                    let session_cookie = Cookie::new("SessionID".to_string(), create_session_id(user.id, &expire_time));
                    let userid_cookie = Cookie::new("UserID".to_string(), format!("{}", user.id));
                    let expires_cookie = Cookie::new("Expires".to_string(), format!("{}", time::strftime("%a, %d-%b-%Y %T %Z", &expire_time).unwrap()));
                    let setcookie = headers::SetCookie(vec![session_cookie, userid_cookie, expires_cookie]);
                    response.headers.set(setcookie);
                    response.headers.set(headers::AccessControlAllowOrigin::Value("*".to_string()));
                    return Ok(response);
                }
            },
            Err(error) => println!("is_logged_in: {:?}", error),
        }
    }

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
    match conn.query(db::GET_USER_BY_HANDLE_SQL, &[&email, &facebook_id, &twitter_id]) {
        Ok(ref rows) => {
            if rows.len() > 0 {
                let row = rows.iter().next().unwrap();
                let user = User {
                    id: row.get(0),
                    name: row.get(1),
                    email: row.get(2),
                    facebook_id: row.get(3),
                    twitter_id: row.get(4),
                    image_url: row.get(5),
                    created_at: row.get(6),
                    updated_at: row.get(7),
                };

                if let Ok(json_output) = json::encode(&user) {
                    let mut response = Response::with((iron::status::Ok, json_output));
                    let expire_time = time::now() + time::Duration::hours(SESSION_DURATION_HOURS);
                    let session_cookie = Cookie::new("SessionID".to_string(), create_session_id(user.id, &expire_time));
                    let userid_cookie = Cookie::new("UserID".to_string(), format!("{}", user.id));
                    let expires_cookie = Cookie::new("Expires".to_string(), format!("{}", time::strftime("%a, %d-%b-%Y %T %Z", &expire_time).unwrap()));
                    let setcookie = headers::SetCookie(vec![session_cookie, userid_cookie, expires_cookie]);
                    response.headers.set(setcookie);
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
    match conn.query(db::INSERT_USER_SQL, &[&name, &email, &facebook_id, &twitter_id]) {
        Ok(ref rows) => {
            let id: i64 = rows.iter().next().unwrap().get(0);
            match conn.query(db::GET_USER_BY_ID_SQL, &[&id]) {
                Ok(rows) => {
                    let row = rows.iter().next().unwrap();
                    let user = User {
                        id: row.get(0),
                        name: row.get(1),
                        email: row.get(2),
                        facebook_id: row.get(3),
                        twitter_id: row.get(4),
                        image_url: row.get(5),
                        created_at: row.get(6),
                        updated_at: row.get(7)
                    };

                    if let Ok(json_output) = json::encode(&user) {
                        let mut response = Response::with((iron::status::Ok, json_output));
                        let expire_time = time::now() + time::Duration::hours(SESSION_DURATION_HOURS);
                        let session_cookie = Cookie::new("SessionID".to_string(), create_session_id(user.id, &expire_time));
                        let userid_cookie = Cookie::new("UserID".to_string(), format!("{}", user.id));
                        let expires_cookie = Cookie::new("Expires".to_string(), format!("{}", time::strftime("%a, %d-%b-%Y %T %Z", &expire_time).unwrap()));
                        let setcookie = headers::SetCookie(vec![session_cookie, userid_cookie, expires_cookie]);
                        response.headers.set(setcookie);
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

fn logout_handler(_: &mut Request) -> IronResult<Response> {
    let mut response = Response::with((iron::status::Ok));
    let session_cookie = Cookie::new("SessionID".to_string(), "deleted".to_string());
    let setcookie = headers::SetCookie(vec![session_cookie]);
    response.headers.set(setcookie);
    response.headers.set(headers::AccessControlAllowOrigin::Value("*".to_string()));
    Ok(response)
}

fn is_logged_in(req: &Request) -> (bool, i64) {
    if let Some(&headers::Cookie(ref cookies)) = req.headers.get::<headers::Cookie>() {
        let mut user_id = None;
        let mut session_id = None;
        let mut expires = None;

        for cookie in cookies {
            if cookie.name == "UserID" {
                user_id = Some(cookie.value.clone());
            } else if cookie.name == "SessionID" {
                session_id = Some(cookie.value.clone());
            } else if cookie.name == "Expires" {
                expires = Some(cookie.value.clone());
            }
        }

        if user_id.is_some() && session_id.is_some() && expires.is_some() {
            let user_id = user_id.unwrap();
            let session_id = session_id.unwrap();
            let expires = expires.unwrap();

            let hash = hmac(SHA1, SESSION_KEY.as_bytes(), &format!("{}|{}", user_id, &expires).as_bytes());
            let mut new_hash = Vec::new();
            for c in &hash {
                new_hash.push(*c % 128);
            }

            let generated_session_id = str::from_utf8(&new_hash).unwrap().to_string();
            if session_id == generated_session_id {
                return (true, user_id.parse::<i64>().unwrap());
            }
        }
    }

    (false, 0)
}

fn get_activities_handler(req: &mut Request) -> IronResult<Response> {
    let (ok, _) = is_logged_in(req);
    if !ok {
        return Ok(Response::with((status::Forbidden)));
    }

    #[derive(RustcEncodable)]
    struct Activity {
        typ: i64,
        user: User,
        predicate: String,
        hoop: Option<Hoop>,
        story: Option<Story>,
        created_at: String,
    }

    // Get database handle
    let mutex = req.get::<Write<DatabaseConnection>>().unwrap();
    let conn = mutex.lock().unwrap();

    let mut activities = Vec::new();

    for row in &conn.query(db::GET_ACTIVITIES_SQL, &[]).unwrap() {
        let mut activity = Activity {
            typ: row.get(0),
            user: User {
                id: row.get(1),
                name: row.get(2),
                email: row.get(3),
                facebook_id: row.get(4),
                twitter_id: row.get(5),
                image_url: row.get(6),
                created_at: row.get(7),
                updated_at: row.get(8),
            },
            predicate: activity::predicate_from_type(row.get(0)),
            hoop: None,
            story: None,
            created_at: "".to_string(),
        };

        let hoop_id: Option<i64> = row.get(9);
        if hoop_id.is_some() {
            let mut hoop = Hoop {
                id: hoop_id.unwrap(),
                user_id: row.get(10),
                name: row.get(11),
                description: row.get(12),
                latitude: row.get(13),
                longitude: row.get(14),
                created_at: "".to_string(),
                updated_at: "".to_string(),
            };

            let created_at: DateTime<UTC> = row.get(15);
            let updated_at: DateTime<UTC> = row.get(16);

            hoop.created_at = created_at.to_rfc2822();
            hoop.updated_at = updated_at.to_rfc2822();

            activity.hoop = Some(hoop);
        }

        let story_id: Option<i64> = row.get(17);
        if story_id.is_some() {
            let mut story = Story {
                id: story_id.unwrap(),
                user_id: row.get(18),
                name: row.get(19),
                description: row.get(20),
                image_url: row.get(21),
                created_at: "".to_string(),
                updated_at: "".to_string(),
            };
            let created_at: DateTime<UTC> = row.get(22);
            let updated_at: DateTime<UTC> = row.get(23);

            story.created_at = created_at.to_rfc2822();
            story.updated_at = updated_at.to_rfc2822();

            activity.story = Some(story);
        }

        let created_at: DateTime<UTC> = row.get(24);
        activity.created_at = created_at.to_rfc2822();
        activities.push(activity);
    }

    if let Ok(json_output) = json::encode(&activities) {
        let mut response = Response::with((iron::status::Ok, json_output));
        response.headers.set(headers::AccessControlAllowOrigin::Value("*".to_string()));
        return Ok(response);
    }

    Ok(Response::with((status::BadRequest)))
}

fn create_session_id(id: i64, expire_time: &time::Tm) -> String {
    let session_id = format!("{}|{}", id, time::strftime("%a, %d-%b-%Y %T %Z", &expire_time).unwrap());
    let hash = hmac(SHA1, SESSION_KEY.as_bytes(), session_id.as_bytes());
    let mut new_hash = Vec::new();
    for c in &hash {
        new_hash.push(*c % 128);
    }
    str::from_utf8(&new_hash).unwrap().to_string()
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

    // Create User table
    if let Err(error) = conn.execute(db::CREATE_USER_TABLE, &[]) {
        if let Error::Db(error) = error {
            if error.code != SqlState::DuplicateTable {
                println!("{:?}", error);
                return;
            }
        }
    }

    // Create Story table
    if let Err(error) = conn.execute(db::CREATE_STORY_TABLE, &[]) {
        if let Error::Db(error) = error {
            if error.code != SqlState::DuplicateTable {
                println!("{:?}", error);
                return;
            }
        }
    }

    // Create Hoop table
    if let Err(error) = conn.execute(db::CREATE_HOOP_TABLE, &[]) {
        if let Error::Db(error) = error {
            if error.code != SqlState::DuplicateTable {
                println!("{:?}", error);
                return;
            }
        }
    }

    // Create Activity table
    if let Err(error) = conn.execute(db::CREATE_ACTIVITY_TABLE, &[]) {
        if let Error::Db(error) = error {
            if error.code != SqlState::DuplicateTable {
                println!("{:?}", error);
                return;
            }
        }
    }

    // Create Activity table
    if let Err(error) = conn.execute(db::CREATE_ACTIVITY_TABLE, &[]) {
        if let Error::Db(error) = error {
            if error.code != SqlState::DuplicateTable {
                println!("{:?}", error);
                return;
            }
        }
    }

    // Create Hoop Featured Story table
    if let Err(error) = conn.execute(db::CREATE_HOOP_FEATURED_STORY_TABLE, &[]) {
        if let Error::Db(error) = error {
            if error.code != SqlState::DuplicateTable {
                println!("{:?}", error);
                return;
            }
        }
    }

    // Create Hoop Story table
    if let Err(error) = conn.execute(db::CREATE_HOOP_STORY_TABLE, &[]) {
        if let Error::Db(error) = error {
            if error.code != SqlState::DuplicateTable {
                println!("{:?}", error);
                return;
            }
        }
    }

    let serve_site = matches.opt_present("serve-site");
    if serve_site {
        let mut router = Router::new();
        router.get("/hoops", get_hoops_handler);
        router.post("/hoop", post_hoop_handler);
        router.delete("/hoop", delete_hoop_handler);
        router.get("/user", get_user_handler);
        router.get("/login", get_login_handler);
        router.post("/login", post_login_handler);
        router.any("/logout", logout_handler);
        router.get("/activities", get_activities_handler);

        let mut mount = Mount::new();
        mount.mount("/", Static::new(Path::new("public")));
        mount.mount("/content", Static::new(Path::new("content")));
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
}
