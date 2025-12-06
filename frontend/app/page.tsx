export default function Home() {
  return (
    <div className="max-w-[900px] mx-auto px-4 pb-12">
      <header className="text-center pt-10 px-4 pb-6">
        {/* Replace the div below with an <img> tag when you have a photo:
             <img src="scott-photo.jpg" alt="Photo of Scott R. McNary" className="w-40 h-40 rounded-full object-cover border-4 border-white/90 shadow-lg mb-5 bg-[#d8dde6] inline-block">
        */}
        <div 
          className="w-40 h-40 rounded-full object-cover border-4 border-white/90 shadow-lg mb-5 bg-[#d8dde6] inline-block" 
          aria-hidden="true"
        />

        <h1 className="text-[2.1rem] tracking-[0.06em] uppercase m-0 font-normal">
          Scott R. McNary
        </h1>
        <div className="text-base my-2 text-[#555]">
          1950 &mdash; 2023
        </div>

        <div className="text-[0.95rem] uppercase tracking-[0.18em] text-[#666] mt-2.5">
          Father &bull; Best Friend &bull; Lover of Animals &bull; Golfer &bull; Reader &bull; Trial Lawyer &bull; Lover of Miami, FL
        </div>
      </header>

      <div 
        className="h-px bg-gradient-to-r from-transparent via-[#c1c7d0] to-transparent my-8"
        aria-hidden="true"
      />

      <main className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6">
        {/* Left column: story / obituary-style text */}
        <section className="bg-white/90 rounded-2xl p-5 shadow-lg backdrop-blur-[10px]" aria-label="Scott's Story">
          <h2 className="text-[1.3rem] mb-3 uppercase tracking-[0.12em] text-[#444] font-normal m-0">
            His Story
          </h2>
          <p className="leading-[1.7] mb-3 text-[#333] m-0">
            Scott R. McNary lived a life full of heart, humor, and fierce devotion.
            He was a steady and loving father, a loyal friend, and a companion who
            brought warmth and laughter into every room he entered.
          </p>
          <p className="leading-[1.7] mb-3 text-[#333] m-0">
            A lover of animals, Scott&apos;s kindness extended to every living creature.
            On the golf course, he found both challenge and peace. As a reader, he
            was endlessly curious about the world. As a trial lawyer, he was
            passionate, prepared, and unafraid to stand up for what he believed was right.
          </p>
          <p className="leading-[1.7] mb-3 text-[#333] m-0">
            Miami, Florida, was one of his great loves &mdash; its light, its energy,
            and its spirit mirrored his own. He is deeply missed, but his influence
            lives on in the people, stories, and places he touched.
          </p>

          <p className="italic border-l-[3px] border-[#c1c7d0] pl-3 mt-3 mb-0 text-[#555] text-[0.98rem]">
            &ldquo;Those we love don&apos;t go away, they walk beside us every day.&rdquo;
          </p>
        </section>

        {/* Right column: quick facts / roles / call for memories */}
        <section className="bg-white/90 rounded-2xl p-5 shadow-lg backdrop-blur-[10px]" aria-label="Remembering Scott">
          <h2 className="text-[1.3rem] mb-3 uppercase tracking-[0.12em] text-[#444] font-normal m-0">
            Remembering Scott
          </h2>

          <ul className="list-none p-0 m-0 text-[0.95rem] flex flex-wrap gap-2">
            <li className="py-1.5 px-2.5 rounded-full border border-[#d0d7e2] bg-[#f8fafc] text-xs tracking-[0.08em] uppercase text-[#555]">
              Father
            </li>
            <li className="py-1.5 px-2.5 rounded-full border border-[#d0d7e2] bg-[#f8fafc] text-xs tracking-[0.08em] uppercase text-[#555]">
              Best Friend
            </li>
            <li className="py-1.5 px-2.5 rounded-full border border-[#d0d7e2] bg-[#f8fafc] text-xs tracking-[0.08em] uppercase text-[#555]">
              Lover of Animals
            </li>
            <li className="py-1.5 px-2.5 rounded-full border border-[#d0d7e2] bg-[#f8fafc] text-xs tracking-[0.08em] uppercase text-[#555]">
              Golfer
            </li>
            <li className="py-1.5 px-2.5 rounded-full border border-[#d0d7e2] bg-[#f8fafc] text-xs tracking-[0.08em] uppercase text-[#555]">
              Reader
            </li>
            <li className="py-1.5 px-2.5 rounded-full border border-[#d0d7e2] bg-[#f8fafc] text-xs tracking-[0.08em] uppercase text-[#555]">
              Trial Lawyer
            </li>
            <li className="py-1.5 px-2.5 rounded-full border border-[#d0d7e2] bg-[#f8fafc] text-xs tracking-[0.08em] uppercase text-[#555]">
              Lover of Miami, FL
            </li>
          </ul>

          <div className="mt-[18px]">
            <p className="leading-[1.7] mb-3 text-[#333] m-0">
              This space is dedicated to honoring Scott&apos;s life and legacy.
              Family and friends are invited to share stories, photos,
              and memories that capture who he was and what he meant to you.
            </p>
            <p className="leading-[1.7] mb-0 text-[#333] m-0">
              Please check back for service details,{' '}
              <a href="/gallery" className="text-blue-600 hover:underline">
                photo galleries
              </a>,
              and ways to celebrate Scott&apos;s life together.
            </p>
          </div>
        </section>
      </main>

      <footer className="text-center text-[0.85rem] text-[#777] mt-8">
        <p className="mb-2">Created with love in memory of Scott R. McNary.</p>
        <p>
          <a href="/gallery" className="text-blue-600 hover:underline">
            View Photo Gallery
          </a>
        </p>
      </footer>
    </div>
  );
}
