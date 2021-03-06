module.exports = (obj, { attendee, booth }, context) => {
  const insertQuery = `
  INSERT INTO records (attendee, booth) VALUES ($1, $2)
  ON CONFLICT (attendee, booth) DO UPDATE SET create_time = NOW()
  RETURNING create_time
  `;
  const selectQuery = `
  SELECT 1 FROM attendees WHERE id = $1 AND check_in IS NOT NULL
  `;
  return context.db.task(t => t.tx(x => x.result(selectQuery, [attendee.id])
    .then((result) => {
      if (result.rowCount === 0) {
        throw new Error('Require Check In');
      }
    })
    .then(() => x.one(insertQuery, [attendee.id, booth.id]))))
    .then(data => ({
      createTime: data.create_time,
      attendee: { id: attendee.id },
      booth: { id: booth.id },
    }));
};
