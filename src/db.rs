pub const CREATE_HOOP_TABLE: &'static str =
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
    )";

pub const CREATE_USER_TABLE: &'static str =
    "CREATE TABLE usr (
        id              BIGSERIAL PRIMARY KEY,
        name            VARCHAR NOT NULL,
        email           VARCHAR,
        facebook_id     VARCHAR,
        twitter_id      VARCHAR,
        created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
        updated_at      TIMESTAMP WITH TIME ZONE NOT NULL,
        UNIQUE (id, email, facebook_id, twitter_id)
    )";

pub const CREATE_ACTIVITY_TABLE: &'static str =
    "CREATE TABLE activity (
        id              BIGSERIAL PRIMARY KEY,
        type            BIGINT NOT NULL,
        user_id         BIGSERIAL NOT NULL,
        hoop_id         BIGSERIAL NOT NULL,
        created_at      TIMESTAMP WITH TIME ZONE NOT NULL
    )";
     
pub const GET_HOOPS_SQL: &'static str =
    "SELECT * FROM hoop";

pub const GET_HOOP_CREATOR_SQL: &'static str =
    "SELECT created_by FROM hoop WHERE id = $1 LIMIT 1";

pub const COUNT_HOOP_WITH_NAME_SQL: &'static str =
    "SELECT COUNT(*) FROM hoop WHERE name LIKE $1";

pub const INSERT_HOOP_SQL: &'static str =
    "INSERT INTO hoop (name, description, image_url, latitude, longitude, created_by, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
     RETURNING id";

pub const DELETE_HOOP_BY_ID_SQL: &'static str =
    "DELETE FROM hoop WHERE id = $1";

pub const GET_USER_SQL: &'static str =
    "SELECT * FROM usr";

pub const GET_USER_BY_ID_SQL: &'static str =
    "SELECT * FROM usr WHERE id = $1 LIMIT 1";

pub const GET_USER_BY_HANDLE_SQL: &'static str =
    "SELECT * FROM usr WHERE email = $1 OR facebook_id = $2 OR twitter_id = $3 LIMIT 1";

pub const INSERT_USER_SQL: &'static str =
    "INSERT INTO usr (name, email, facebook_id, twitter_id, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     RETURNING id";

pub const GET_ACTIVITIES_SQL: &'static str =
    "SELECT activity.type, usr.*, hoop.*, activity.created_at FROM activity
     INNER JOIN usr ON (activity.user_id = usr.id)
     INNER JOIN hoop ON (activity.hoop_id = hoop.id)
     ORDER BY activity.created_at DESC";

pub const INSERT_ACTIVITY_SQL: &'static str =
    "INSERT INTO activity (type, user_id, hoop_id, created_at)
     VALUES ($1, $2, $3, NOW())
     RETURNING id";
