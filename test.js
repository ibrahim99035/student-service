const BASE_URL = 'http://localhost:3000/students';

async function run() {
  console.log('\n--- GET all students ---');
  let res = await fetch(BASE_URL);
  console.log(await res.json());

  console.log('\n--- GET student by ID (1) ---');
  res = await fetch(`${BASE_URL}/1`);
  console.log(await res.json());

  console.log('\n--- POST new student ---');
  res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Ali', age: 22 }),
  });
  const created = await res.json();
  console.log(created);

  console.log(`\n--- PUT update student (${created.id}) ---`);
  res = await fetch(`${BASE_URL}/${created.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Ali Updated', age: 23 }),
  });
  console.log(await res.json());

  console.log(`\n--- DELETE student (${created.id}) ---`);
  res = await fetch(`${BASE_URL}/${created.id}`, { method: 'DELETE' });
  console.log(await res.json());

  console.log('\n--- GET all students after delete ---');
  res = await fetch(BASE_URL);
  console.log(await res.json());

  console.log('\n--- GET non-existent student (999) ---');
  res = await fetch(`${BASE_URL}/999`);
  console.log(res.status, await res.json());
}

run();
