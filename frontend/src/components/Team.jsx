/** Team grid: 3 + 2 centered on large screens; 2 columns on mobile */
const members = [
  {
    name: 'Mukasa Matthew',
    role: 'CEO & Co-Founder',
    initials: 'MM',
    photo: encodeURI('/Team/WhatsApp Image 2026-04-05 at 2.52.31 PM.jpeg'),
    linkedin: 'https://www.linkedin.com/in/mukasa-matthew-aa8048319',
  },
  {
    name: 'Katusiime Martha Praise',
    role: 'Marketing Lead',
    initials: 'KM',
    photo: encodeURI('/Team/WhatsApp Image 2026-04-05 at 2.45.24 PM.jpeg'),
    linkedin: 'https://www.linkedin.com/in/martha-praise-katusiime-15455b328',
  },
  {
    name: 'Ocen Deolino',
    role: 'Lead Developer',
    initials: 'OD',
    photo: encodeURI('/Team/WhatsApp Image 2026-04-05 at 5.07.18 PM.jpeg'),
  },
  {
    name: 'Elly Naguma',
    role: 'UI/UX Designer',
    initials: 'EN',
    photo: encodeURI('/Team/WhatsApp Image 2026-04-05 at 3.54.40 PM.jpeg'),
  },
  {
    name: 'Kikomeko Ibrahim',
    role: 'Business Development',
    initials: 'KI',
    photo: encodeURI('/Team/WhatsApp Image 2026-04-05 at 3.00.45 PM.jpeg'),
    linkedin: 'https://www.linkedin.com/in/kikomeko-ibrahim-1612b0364',
  },
]

function LinkedInIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.5 8.5h3V21h-3V8.5zM8 4.25A1.75 1.75 0 106.25 6 1.75 1.75 0 008 4.25zM13.5 8.5H16v1.7h.05c.4-.75 1.4-1.55 2.9-1.55 3.1 0 3.65 2 3.65 4.6V21h-3v-6.1c0-1.45-.03-3.3-2-3.3-2 0-2.3 1.55-2.3 3.15V21h-3V8.5z" />
    </svg>
  )
}

function MemberAvatar({ member, size }) {
  const isLarge = size === 'lg'
  const box = isLarge ? 'h-28 w-28 text-xl' : 'h-24 w-24 text-lg sm:h-28 sm:w-28 sm:text-xl'

  if (member.photo) {
    return (
      <div
        className={`${box} shrink-0 overflow-hidden rounded-full bg-navy/5 ring-2 ring-navy/15 shadow-md`}
      >
        <img
          src={member.photo}
          alt={`${member.name}, ${member.role}`}
          className="h-full w-full object-cover object-[center_20%]"
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div
      className={`${box} flex shrink-0 items-center justify-center rounded-full bg-navy font-heading font-bold text-white`}
      aria-label={member.name}
    >
      {member.initials}
    </div>
  )
}

function MemberCard({ member, size }) {
  return (
    <article className="flex flex-col items-center text-center">
      <MemberAvatar member={member} size={size} />
      <h3
        className={`mt-4 font-heading font-semibold text-navy ${size === 'lg' ? 'text-lg' : 'text-base sm:text-lg'}`}
      >
        {member.name}
      </h3>
      <p className={`mt-1 text-mid ${size === 'lg' ? '' : 'text-sm'}`}>{member.role}</p>
      {member.linkedin ? (
        <a
          href={member.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex text-blue transition-colors hover:text-sky"
          aria-label={`${member.name} on LinkedIn (opens in new tab)`}
        >
          <LinkedInIcon />
        </a>
      ) : null}
    </article>
  )
}

export default function Team() {
  const [a, b, c, d, e] = members
  const row1 = [a, b, c]
  const row2 = [d, e]

  return (
    <section id="team" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-heading text-3xl font-bold text-navy sm:text-4xl">
          Meet the Team Behind EduBridge
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-mid">
          A passionate group of students from Uganda Christian University building the future of
          education.
        </p>

        <div className="mt-12 grid grid-cols-2 gap-6 sm:gap-8 lg:hidden">
          {members.map((m) => (
            <MemberCard key={m.name} member={m} size="sm" />
          ))}
        </div>

        <div className="mt-12 hidden flex-col items-center gap-10 lg:flex">
          <div className="flex w-full max-w-5xl flex-wrap justify-center gap-10">
            {row1.map((m) => (
              <div key={m.name} className="w-64">
                <MemberCard member={m} size="lg" />
              </div>
            ))}
          </div>
          <div className="flex w-full max-w-3xl flex-wrap justify-center gap-10">
            {row2.map((m) => (
              <div key={m.name} className="w-64">
                <MemberCard member={m} size="lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
