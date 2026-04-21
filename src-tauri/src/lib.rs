use std::path::PathBuf;
use tauri::Manager;
use directories::ProjectDirs;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};


#[allow(non_snake_case)]
#[derive(Serialize, Deserialize)]
struct Employee {
  id: String,
  name: Option<String>,
  jobNumber: Option<String>,
  transportation: Option<String>,
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize)]
struct AttendanceRecord {
  id: String,
  employeeId: String,
  date: String,
  status: Option<String>,
  jobNumber: Option<String>,
  note: Option<String>,
  hoursLate: Option<f64>,
  overtimeHours: Option<f64>,
}

#[derive(Deserialize)]
struct AttendanceFilter {
  employee_id: Option<String>,
  from_date: Option<String>,
  to_date: Option<String>,
  status: Option<String>,
}

fn init_db(path: &PathBuf) -> Result<(), String> {
  let conn = Connection::open(path).map_err(|e| e.to_string())?;
  conn.execute_batch(
    "BEGIN;
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT,
      jobNumber TEXT,
      transportation TEXT
    );
    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      employeeId TEXT,
      date TEXT,
      status TEXT,
      jobNumber TEXT,
      note TEXT,
      hoursLate REAL,
      overtimeHours REAL
    );
    COMMIT;",
  )
  .map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
fn get_employees(db_path: tauri::State<'_, String>) -> Result<Vec<Employee>, String> {
  let conn = Connection::open(&*db_path).map_err(|e| e.to_string())?;
  let mut stmt = conn
    .prepare("SELECT id, name, jobNumber, transportation FROM employees")
    .map_err(|e| e.to_string())?;
  let rows = stmt
    .query_map([], |row| {
      Ok(Employee {
        id: row.get(0)?,
        name: row.get(1)?,
        jobNumber: row.get(2)?,
        transportation: row.get(3)?,
      })
    })
    .map_err(|e| e.to_string())?;
  let mut results = Vec::new();
  for r in rows {
    results.push(r.map_err(|e| e.to_string())?);
  }
  Ok(results)
}

#[tauri::command]
fn add_employee(db_path: tauri::State<'_, String>, emp: Employee) -> Result<Employee, String> {
  let conn = Connection::open(&*db_path).map_err(|e| e.to_string())?;
  conn.execute(
    "INSERT INTO employees (id, name, jobNumber, transportation) VALUES (?1,?2,?3,?4)",
    params![emp.id, emp.name, emp.jobNumber, emp.transportation],
  )
  .map_err(|e| e.to_string())?;
  Ok(emp)
}

#[tauri::command]
fn update_employee(db_path: tauri::State<'_, String>, id: String, updated: Employee) -> Result<Option<Employee>, String> {
  let conn = Connection::open(&*db_path).map_err(|e| e.to_string())?;
  conn.execute(
    "UPDATE employees SET name=?1, jobNumber=?2, transportation=?3 WHERE id=?4",
    params![updated.name, updated.jobNumber, updated.transportation, id],
  )
  .map_err(|e| e.to_string())?;
  Ok(Some(updated))
}

#[tauri::command]
fn delete_employee(db_path: tauri::State<'_, String>, id: String) -> Result<(), String> {
  let conn = Connection::open(&*db_path).map_err(|e| e.to_string())?;
  conn.execute("DELETE FROM employees WHERE id=?1", params![id]).map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
fn get_attendance(db_path: tauri::State<'_, String>) -> Result<Vec<AttendanceRecord>, String> {
  let conn = Connection::open(&*db_path).map_err(|e| e.to_string())?;
  let mut stmt = conn
    .prepare("SELECT id, employeeId, date, status, jobNumber, note, hoursLate, overtimeHours FROM attendance")
    .map_err(|e| e.to_string())?;
  let rows = stmt
    .query_map([], |row| {
      Ok(AttendanceRecord {
        id: row.get(0)?,
        employeeId: row.get(1)?,
        date: row.get(2)?,
        status: row.get(3)?,
        jobNumber: row.get(4)?,
        note: row.get(5)?,
        hoursLate: row.get(6)?,
        overtimeHours: row.get(7)?,
      })
    })
    .map_err(|e| e.to_string())?;
  let mut results = Vec::new();
  for r in rows {
    results.push(r.map_err(|e| e.to_string())?);
  }
  Ok(results)
}

#[tauri::command]
fn add_attendance(db_path: tauri::State<'_, String>, rec: AttendanceRecord) -> Result<AttendanceRecord, String> {
  let conn = Connection::open(&*db_path).map_err(|e| e.to_string())?;
  conn.execute(
    "INSERT INTO attendance (id, employeeId, date, status, jobNumber, note, hoursLate, overtimeHours) VALUES (?1,?2,?3,?4,?5,?6,?7,?8)",
    params![rec.id, rec.employeeId, rec.date, rec.status, rec.jobNumber, rec.note, rec.hoursLate, rec.overtimeHours],
  )
  .map_err(|e| e.to_string())?;
  Ok(rec)
}

#[tauri::command]
fn update_attendance(db_path: tauri::State<'_, String>, id: String, updated: AttendanceRecord) -> Result<Option<AttendanceRecord>, String> {
  let conn = Connection::open(&*db_path).map_err(|e| e.to_string())?;
  conn.execute(
    "UPDATE attendance SET employeeId=?1, date=?2, status=?3, jobNumber=?4, note=?5, hoursLate=?6, overtimeHours=?7 WHERE id=?8",
    params![updated.employeeId, updated.date, updated.status, updated.jobNumber, updated.note, updated.hoursLate, updated.overtimeHours, id],
  )
  .map_err(|e| e.to_string())?;
  Ok(Some(updated))
}

#[tauri::command]
fn delete_attendance(db_path: tauri::State<'_, String>, id: String) -> Result<(), String> {
  let conn = Connection::open(&*db_path).map_err(|e| e.to_string())?;
  conn.execute("DELETE FROM attendance WHERE id=?1", params![id]).map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
fn delete_attendance_by_employee_id(db_path: tauri::State<'_, String>, employee_id: String) -> Result<(), String> {
  let conn = Connection::open(&*db_path).map_err(|e| e.to_string())?;
  conn.execute("DELETE FROM attendance WHERE employeeId=?1", params![employee_id]).map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
fn get_attendance_filtered(
  db_path: tauri::State<'_, String>,
  filter: AttendanceFilter,
) -> Result<Vec<AttendanceRecord>, String> {
  let AttendanceFilter {
    employee_id,
    from_date,
    to_date,
    status,
  } = filter;

  let conn = Connection::open(&*db_path).map_err(|e| format!("Failed to open database: {}", e))?;

  // Build dynamic query based on filters
  let mut query = "SELECT id, employeeId, date, status, jobNumber, note, hoursLate, overtimeHours FROM attendance WHERE 1=1".to_string();
  let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

  if let Some(ref eid) = employee_id {
    query.push_str(" AND employeeId = ?");
    params.push(Box::new(eid.clone()));
  }
  if let Some(ref fd) = from_date {
    query.push_str(" AND date >= ?");
    params.push(Box::new(fd.clone()));
  }
  if let Some(ref td) = to_date {
    query.push_str(" AND date <= ?");
    params.push(Box::new(td.clone()));
  }
  if let Some(ref st) = status {
    query.push_str(" AND status = ?");
    params.push(Box::new(st.clone()));
  }

  query.push_str(" ORDER BY date DESC");

  let mut stmt = conn.prepare(&query).map_err(|e| format!("Failed to prepare query: {}", e))?;

  // Convert params to references for rusqlite
  let param_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|p| p.as_ref()).collect();

  let rows = stmt
    .query_map(rusqlite::params_from_iter(param_refs.into_iter()), |row| {
      Ok(AttendanceRecord {
        id: row.get(0)?,
        employeeId: row.get(1)?,
        date: row.get(2)?,
        status: row.get(3)?,
        jobNumber: row.get(4)?,
        note: row.get(5)?,
        hoursLate: row.get(6)?,
        overtimeHours: row.get(7)?,
      })
    })
    .map_err(|e| format!("Failed to execute query: {}", e))?;

  let mut results = Vec::new();
  for r in rows {
    results.push(r.map_err(|e| format!("Failed to parse row: {}", e))?);
  }

  Ok(results)
}

#[tauri::command]
fn get_overtime_by_date_range(
  db_path: tauri::State<'_, String>,
  from_date: String,
  to_date: String,
) -> Result<Vec<(String, String, f64)>, String> {
  let conn = Connection::open(&*db_path).map_err(|e| e.to_string())?;
  let mut stmt = conn
    .prepare(
      "SELECT e.id, e.name, COALESCE(SUM(a.overtimeHours), 0) as total_overtime FROM employees e LEFT JOIN attendance a ON e.id = a.employeeId WHERE a.date BETWEEN ? AND ? GROUP BY e.id, e.name ORDER BY e.name",
    )
    .map_err(|e| e.to_string())?;

  let rows = stmt
    .query_map([&from_date, &to_date], |row| {
      Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?, row.get::<_, f64>(2)?))
    })
    .map_err(|e| e.to_string())?;

  let mut results = Vec::new();
  for r in rows {
    results.push(r.map_err(|e| e.to_string())?);
  }
  Ok(results)
}

// TODO: Add function to save imported employees
// #[tauri::command]
// pub fn import_employees(
//     employees: Vec<Employee>,
//     state: State<Db>,
// ) -> Result<(), String> {
//     let conn = state.conn.lock().map_err(|e| e.to_string())?;

//     let tx = conn.transaction().map_err(|e| e.to_string())?;

//     for emp in employees {
//         tx.execute(
//             "INSERT OR REPLACE INTO employees (id, name, job_number, transportation)
//              VALUES (?1, ?2, ?3, ?4)",
//             params![
//                 emp.id,
//                 emp.name,
//                 emp.job_number,
//                 emp.transportation
//             ],
//         )
//         .map_err(|e| e.to_string())?;
//     }

//     tx.commit().map_err(|e| e.to_string())?;

//     Ok(())
// }

#[tauri::command]
fn migrate_from_local(db_path: tauri::State<'_, String>, employees_json: String, attendance_json: String) -> Result<(), String> {
  let mut conn = Connection::open(&*db_path).map_err(|e| e.to_string())?;
  let employees: Vec<Employee> = serde_json::from_str(&employees_json).map_err(|e| e.to_string())?;
  let attendance: Vec<AttendanceRecord> = serde_json::from_str(&attendance_json).map_err(|e| e.to_string())?;
  let tx = conn.transaction().map_err(|e| e.to_string())?;
  for emp in employees {
    tx.execute(
      "INSERT OR REPLACE INTO employees (id, name, jobNumber, transportation) VALUES (?1,?2,?3,?4)",
      params![emp.id, emp.name, emp.jobNumber, emp.transportation],
    )
    .map_err(|e| e.to_string())?;
  }
  for rec in attendance {
    tx.execute(
      "INSERT OR REPLACE INTO attendance (id, employeeId, date, status, jobNumber, note, hoursLate) VALUES (?1,?2,?3,?4,?5,?6,?7)",
      params![rec.id, rec.employeeId, rec.date, rec.status, rec.jobNumber, rec.note, rec.hoursLate],
    )
    .map_err(|e| e.to_string())?;
  }
  tx.commit().map_err(|e| e.to_string())?;
  Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // initialize DB path in app data dir
      // resolve a platform-appropriate data directory using `directories`
      let proj = match ProjectDirs::from("com", "you", "attendance") {
        Some(p) => p,
        None => return Err("cannot resolve project directories".into()),
      };

      let data_dir: PathBuf = proj.data_dir().to_path_buf();
      if let Err(e) = std::fs::create_dir_all(&data_dir) {
        return Err(format!("failed to create app data dir: {}", e).into());
      }

      let db_path = data_dir.join("attendance.db");
      if let Err(e) = init_db(&db_path) {
        return Err(format!("failed to initialize database: {}", e).into());
      }

      // store db path in managed state for commands
      let db_path_str = db_path.to_string_lossy().to_string();
      app.manage(db_path_str);
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      get_employees,
      add_employee,
      update_employee,
      delete_employee,
      get_attendance,
      add_attendance,
      migrate_from_local,
      update_attendance,
      delete_attendance,
      delete_attendance_by_employee_id,
      get_attendance_filtered,
      get_overtime_by_date_range,
      // import_employees
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
