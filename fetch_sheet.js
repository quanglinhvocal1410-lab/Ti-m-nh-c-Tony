fetch('https://docs.google.com/spreadsheets/d/1JiPQORvSP9tHiQcukGlC_cGvgK3BKjtC8vP-XNtlKeM/gviz/tq?tqx=out:csv&sheet=Checkin')
  .then(res => res.text())
  .then(data => {
    const lines = data.split('\n');
    for (let i = 0; i < 10; i++) {
      console.log(`Line ${i}: ${lines[i]}`);
    }
  })
  .catch(err => console.error(err));
