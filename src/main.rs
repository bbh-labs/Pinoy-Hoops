extern crate iron;
extern crate mount;
//extern crate persistent;
extern crate router;
extern crate staticfile;
extern crate getopts;

// Std
use std::env;
use std::path::Path;

// Iron
use iron::prelude::*;

// Mount
use mount::Mount;

// Router
use router::Router;

// Persistent
//use persistent::Write;

// Static File
use staticfile::Static;

// Getopts
use getopts::Options;

fn hoops_handler(_req: &mut Request) -> IronResult<Response> {
    Ok(Response::with((iron::status::Ok)))
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
                "host",
                "set server host",
                "HOST");
    opts.optopt("",
                "port",
                "set server port",
                "PORT");
    opts.optflag("", "serve-website", "");
    opts.optflag("h", "help", "print this help menu");

    let matches = match opts.parse(&args[1..]) {
        Ok(m) => m,
        Err(f) => panic!(f.to_string()),
    };
    if matches.opt_present("h") {
        print_usage(&program, opts);
        return;
    }

    let mut router = Router::new();
    router.get("/hoops", hoops_handler);

    let mut mount = Mount::new();
    if matches.opt_present("serve-website") {
        mount.mount("/", Static::new(Path::new("public")));
    }
    mount.mount("/api", router);

    let chain = Chain::new(mount);
    //chain.link(Write::<DatabaseConnection>::both(conn));

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
