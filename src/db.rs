pub const CREATE_USER_TABLE: &'static str =
"CREATE TABLE \"user\" (
	id bigserial PRIMARY KEY,
	name varchar(255),
	email varchar(255),
	facebook_id varchar(255),
	twitter_id varchar(255),
	image_url varchar(255),
	created_at timestamp with time zone not null,
	updated_at timestamp with time zone not null
)";

pub const CREATE_HOOP_TABLE: &'static str =
"CREATE TABLE hoop (
	id bigserial primary key,
	user_id bigserial not null,
	name varchar(255) not null,
	description varchar(255) not null,
	latitude real not null,
	longitude real not null,
	created_at timestamp with time zone not null,
	updated_at timestamp with time zone not null,
	UNIQUE (name),
	FOREIGN KEY(user_id) REFERENCES \"user\" (id)
)";

pub const CREATE_STORY_TABLE: &'static str = "
CREATE TABLE story (
	id bigserial primary key,
	user_id bigserial not null,
	name varchar(255) not null,
	description varchar(255) not null,
	image_url varchar(255) not null,
	created_at timestamp with time zone not null,
	updated_at timestamp with time zone not null,
	FOREIGN KEY(user_id) REFERENCES \"user\" (id)
)";

pub const CREATE_ACTIVITY_TABLE: &'static str = "
CREATE TABLE activity (
	id bigserial primary key,
	user_id bigserial not null,
	type bigint not null,
	hoop_id bigserial,
	story_id bigserial,
	created_at timestamp with time zone not null,
	FOREIGN KEY(user_id) REFERENCES \"user\" (id)
)";

pub const CREATE_HOOP_FEATURED_STORY_TABLE: &'static str = "
CREATE TABLE hoop_featured_story (
	hoop_id bigserial not null,
	story_id bigserial not null,
	FOREIGN KEY(hoop_id) REFERENCES hoop (id),
	FOREIGN KEY(story_id) REFERENCES story (id)
)";

pub const CREATE_HOOP_STORY_TABLE: &'static str = "
CREATE TABLE hoop_story (
	hoop_id bigserial not null,
	story_id bigserial not null,
	FOREIGN KEY(hoop_id) REFERENCES hoop (id),
	FOREIGN KEY(story_id) REFERENCES story (id)
)";

pub const GET_USER_BY_ID_SQL: &'static str = "
SELECT * FROM \"user\"
WHERE id = $1
LIMIT 1";

pub const GET_USER_BY_HANDLE_SQL: &'static str = "
SELECT * FROM \"user\"
WHERE email = $1 OR facebook_id = $2 OR twitter_id = $3
LIMIT 1";

pub const INSERT_USER_SQL: &'static str = "
INSERT INTO \"user\" (name, email, facebook_id, twitter_id, created_at, updated_at)
VALUES ($1, $2, $3, $4, NOW(), NOW())
RETURNING id";

pub const INSERT_STORY_SQL: &'static str = "
INSERT INTO story (user_id, name, description, image_url, created_at, updated_at)
VALUES ($1, $2, $3, $4, NOW(), NOW())
RETURNING id";

pub const GET_STORIES_SQL: &'static str = "
SELECT story.* FROM story
INNER JOIN hoop_story ON story.id = hoop_story.story_id
WHERE hoop_story.hoop_id = $1";

pub const GET_HOOPS_SQL: &'static str = "
SELECT * FROM hoop";

pub const GET_HOOP_USER_ID_SQL: &'static str = "
SELECT user_id FROM hoop WHERE id = $1 LIMIT 1";

pub const COUNT_HOOP_BY_NAME_SQL: &'static str = "
SELECT COUNT(id) FROM hoop WHERE name LIKE $1";
    
pub const INSERT_HOOP_SQL: &'static str = "
INSERT INTO hoop (user_id, name, description, latitude, longitude, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
RETURNING id";

pub const DELETE_HOOP_BY_ID_SQL: &'static str = "
DELETE FROM hoop WHERE id = $1";

pub const INSERT_HOOP_STORY_SQL: &'static str = "
INSERT INTO hoop_story (hoop_id, story_id)
VALUES ($1, $2)";

pub const INSERT_HOOP_FEATURED_STORY_SQL: &'static str = "
INSERT INTO hoop_featured_story (hoop_id, story_id)
VALUES ($1, $2)";

pub const GET_ACTIVITIES_SQL: &'static str = "
SELECT activity.type, \"user\".*, hoop.*, story.*, activity.created_at FROM activity
LEFT OUTER JOIN \"user\" ON activity.user_id = \"user\".id
LEFT OUTER JOIN hoop ON activity.hoop_id = hoop.id
LEFT OUTER JOIN story ON activity.story_id = story.id
ORDER BY activity.created_at DESC";

pub const INSERT_ACTIVITY_WITH_HOOP_SQL: &'static str = "
INSERT INTO activity (type, user_id, hoop_id, created_at)
VALUES ($1, $2, $3, NOW())
RETURNING id";
