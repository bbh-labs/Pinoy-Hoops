pub enum Type {
    AddHoop = 1,
    AddStoryToHoop = 2,
}

pub fn predicate_from_type(typ: i64) -> String {
    match typ {
        typ if typ == Type::AddHoop as i64 => " added a new hoop ",
        typ if typ == Type::AddStoryToHoop as i64 => " added new story to hoop ",
        _ => "",
    }.to_string()
}
