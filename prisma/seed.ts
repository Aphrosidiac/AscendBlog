import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { randomBytes, scrypt as _scrypt } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(_scrypt) as (p: string, s: Buffer, l: number) => Promise<Buffer>
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

async function hash(pw: string) {
  const salt = randomBytes(16)
  const key = await scrypt(pw, salt, 64)
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`
}

const slugify = (t: string, id: string) =>
  `${t.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 72).replace(/-+$/, '')}-${id.slice(-12)}`

const words = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').length
const excerpt = (html: string, n = 140) => {
  const t = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return t.length > n ? t.slice(0, n).trimEnd() + '…' : t
}

const TAGS = [
  ['performance', 'Performance', 'Training, recovery, and the science of doing hard things well.'],
  ['longevity', 'Longevity', 'Living longer, and living better while you do it.'],
  ['science', 'Science', 'What the research actually says, and where it stops.'],
  ['building', 'Building', 'Notes from people making things.'],
  ['health', 'Health', 'Practical, evidence-led health writing.'],
  ['engineering', 'Engineering', 'Systems, tradeoffs, and the craft of software.'],
  ['design', 'Design', 'Interfaces, typography, and taste.'],
  ['writing', 'Writing', 'On the work of putting words in order.'],
]

const PEOPLE = [
  { username: 'fakhrul', name: 'Fakhrul', email: 'rikaidrawings@gmail.com', bio: 'Lead dev at Lewix.ai. Building things that ship.', verified: true },
  { username: 'amira_z', name: 'Amira Zainal', email: 'amira@ascend.test', bio: 'Sports scientist. Writes about recovery and the limits of self-experimentation.' },
  { username: 'danielokoye', name: 'Daniel Okoye', email: 'daniel@ascend.test', bio: 'Physiologist. Sceptic. Occasionally wrong in public.' },
  { username: 'lin_wei', name: 'Lin Wei', email: 'lin@ascend.test', bio: 'Designer. Interested in typography and the quiet parts of interfaces.' },
  { username: 'sofia_m', name: 'Sofia Marchetti', email: 'sofia@ascend.test', bio: 'Writes about metabolic health without the hype.' },
]

const STORIES: Array<{
  author: string; pub?: string; title: string; subtitle: string; tags: string[]; body: string; days: number; member?: boolean
}> = [
  {
    author: 'amira_z', pub: 'ascend-lab', days: 2,
    title: 'The Recovery Metric Everyone Tracks and Almost Nobody Uses Properly',
    subtitle: 'Heart rate variability is a real signal. It is also the most misread number in consumer fitness.',
    tags: ['performance', 'science'],
    body: `<p>There is a particular kind of disappointment that comes from buying a device that promises insight and delivers a number. You wake up, you check the app, and it says 42. Yesterday it said 61. Nothing about your life explains the gap, and yet you spend the morning quietly convinced you have done something wrong.</p>
<p>Heart rate variability is not a fake signal. The research behind it is decades deep and mostly sound. The problem is that the number on your wrist is answering a narrower question than the one you are asking.</p>
<h2>What the number actually measures</h2>
<p>HRV describes the variation in time between consecutive heartbeats. A heart that beats exactly once per second is not a healthy heart. Some variability means your autonomic nervous system is responsive — able to shift between the sympathetic and parasympathetic states as conditions change.</p>
<p>So far so good. The trouble starts when a single morning reading gets treated as a verdict on your readiness to train.</p>
<h2>Three things that move the number and have nothing to do with fitness</h2>
<p>Sleep position changes HRV. So does the time you took the reading relative to waking. So does a glass of wine at dinner, ambient room temperature, and whether you were lying still or had already sat up to silence an alarm.</p>
<p>None of these are noise in the statistical sense. They are real physiological effects. They are simply not the effect you were trying to measure.</p>
<h2>The version that works</h2>
<p>Stop reading the daily number. Take a seven-day rolling average and compare it to your own thirty-day baseline. Look for sustained departures, not single-day dips.</p>
<p>This is less satisfying. It gives you a verdict once a week instead of once a day, and it will not tell you anything interesting most weeks. That is the correct behaviour for a monitoring system. A signal that alarms every morning is not sensitive — it is broken.</p>
<blockquote>The useful question is not "how did I sleep" but "has something changed over a period long enough that it cannot be explained by where my arm was".</blockquote>
<p>Measured that way, HRV catches the things it is genuinely good at catching: the beginning of an illness, the accumulation of training load past what you are absorbing, and long stretches of poor sleep. Those are worth knowing. They are also the things you would probably notice anyway, which is a reasonable argument for spending less on the device and more on the sleep.</p>`,
  },
  {
    author: 'danielokoye', days: 5,
    title: 'I Spent a Year Reading the Studies Behind the Supplements I Was Taking',
    subtitle: 'Six held up. Most did not. Here is how I decided which was which.',
    tags: ['health', 'science'], member: true,
    body: `<p>I started with eleven bottles on the shelf and a vague sense that I had chosen them well. I had read about all of them. I had, I thought, been careful.</p>
<p>A year later there are four bottles. This is the story of how the other seven left.</p>
<h2>The method, such as it was</h2>
<p>For each compound I asked four questions in order, and stopped at the first no.</p>
<p>Is there a randomised controlled trial in humans? Not a mechanism, not a mouse, not an observational cohort with a confidence interval you could drive a bus through. A trial.</p>
<p>Was it powered to detect the effect it claims? A study of fourteen people is a pilot. It tells you the experiment is worth running properly. It does not tell you the thing works.</p>
<p>Was the effect size worth the money? Statistical significance is not the same as mattering. A supplement that reliably improves an outcome by two percent is a real finding and a bad purchase.</p>
<p>Has it replicated? Once is a result. Twice, in different labs, is a finding.</p>
<h2>What survived</h2>
<p>Creatine monohydrate cleared all four without effort. It is the most studied ergogenic aid there is, the effect size is large, and it costs almost nothing. Vitamin D survived conditionally — it matters a great deal if you are deficient and very little if you are not, which makes the blood test the actual product.</p>
<p>Caffeine survived, obviously, though I stopped pretending it was a supplement rather than a drug I enjoy.</p>
<h2>What did not, and why it stung</h2>
<p>The ones that hurt were not the obvious frauds. They were the compounds with beautiful mechanisms — plausible pathways, elegant biochemistry, a story that made sense at every step. Then you look for the trial and it is a dozen people for four weeks with a surrogate endpoint.</p>
<p>A mechanism is a hypothesis. It is the reason to run the experiment, not a substitute for having run it. I knew this. I had said it to other people. It turns out knowing a principle and applying it to your own shelf are different skills.</p>`,
  },
  {
    author: 'lin_wei', pub: 'ascend-lab', days: 9,
    title: 'Why Your Interface Feels Cheap (It Is Almost Always the Type)',
    subtitle: 'Four typographic decisions that separate software that feels considered from software that does not.',
    tags: ['design', 'building'],
    body: `<p>Clients rarely say "the typography is wrong." They say it feels cheap, or unfinished, or that it does not look like the other one. Then they point at a colour.</p>
<p>It is almost never the colour.</p>
<h2>Line length is the one nobody checks</h2>
<p>Comfortable reading happens between 45 and 75 characters per line. Most dashboards run text at 120 characters because the container was full width and nobody thought about it.</p>
<p>The reader does not consciously notice. They just find the page tiring, read less of it, and leave earlier. Set a max width on your text containers. It is the highest-leverage change available to you and it takes one line.</p>
<h2>Line height should fall as size rises</h2>
<p>Body text wants roughly 1.5. A 42px headline at 1.5 looks like a ransom note with gaps you could park in. Large type wants 1.1 to 1.25.</p>
<p>If you set a single line-height on the body and let it cascade, every heading on your site is slightly wrong in a way that is hard to name and easy to feel.</p>
<h2>Tracking works the opposite way</h2>
<p>Large text needs negative letter-spacing. Type designers fit spacing for text sizes; at display sizes those same sidebearings read as gaps. A headline at 42px usually wants somewhere around -0.01em to -0.02em.</p>
<p>Small text, especially uppercase small text, wants positive tracking. The same rule inverted.</p>
<h2>Pick a scale and refuse to leave it</h2>
<p>Most interfaces I audit have between nine and fourteen distinct font sizes, arrived at one component at a time. A considered interface has five or six.</p>
<p>The constraint is the point. When you cannot invent a new size, you are forced to express hierarchy with weight, colour, and space — which is what actually creates hierarchy. Size was always the blunt instrument.</p>`,
  },
  {
    author: 'fakhrul', days: 1,
    title: 'Ship the Boring Version First',
    subtitle: 'A note on the difference between building something clever and building something that exists.',
    tags: ['building', 'engineering'],
    body: `<p>Every project I have shipped late was late for the same reason. I built the interesting version before I built the working one.</p>
<h2>The trap has a nice shape</h2>
<p>You start a feature and you can see the elegant abstraction from where you are standing. Not the version that solves today's problem — the version that solves this whole category of problem, forever, with a clean interface.</p>
<p>It is genuinely more fun to build. That is what makes it dangerous. You are not procrastinating; you are working hard, on the wrong thing, with real conviction.</p>
<h2>What boring buys you</h2>
<p>The boring version is in front of a user this week. That matters more than it sounds, because roughly half of what you believe about the problem is wrong, and you cannot find out which half from inside your own head.</p>
<p>Every day the clever version spends unbuilt is a day you are accumulating assumptions you cannot test. The abstraction you designed for a category of problems is fitted to an imagined category. When the real usage arrives it rarely matches, and now you have a general solution to a problem nobody has, plus the maintenance burden of having generalised it.</p>
<h2>The honest counterargument</h2>
<p>Sometimes you do know the shape in advance. If you have built the same thing four times, build the abstraction — you have earned it with evidence.</p>
<p>The test is whether the generality comes from experience or from imagination. Mine, when I am honest, is usually imagination wearing experience's coat.</p>
<blockquote>Build the thing that is embarrassing and works. You can always make it elegant once you know what it is.</blockquote>`,
  },
  {
    author: 'sofia_m', days: 14,
    title: 'Fasting Research Is Better Than the Sceptics Say and Worse Than the Books Claim',
    subtitle: 'The evidence is real, the mechanisms are interesting, and the effect sizes are smaller than you have been told.',
    tags: ['health', 'longevity', 'science'],
    body: `<p>Two things are true at once, which is why this topic generates so much heat. Time-restricted eating has real physiological effects. And most of the dramatic claims made for it do not survive contact with a controlled trial.</p>
<h2>What holds up</h2>
<p>Confining eating to a window reduces total intake for most people without any explicit instruction to eat less. That is a genuinely useful finding — it is an adherence tool that works by removing decisions rather than adding rules.</p>
<p>There are also measurable effects on insulin sensitivity and on markers of circadian alignment, particularly when the eating window sits earlier in the day.</p>
<h2>What does not</h2>
<p>The claim that fasting produces weight loss beyond what the calorie reduction explains has been tested directly and mostly fails. When trials match intake between a fasting group and a continuous-restriction group, the differences largely disappear.</p>
<p>This should not be surprising, and it does not make the practice useless. It relocates the benefit from metabolic magic to behavioural design, which is a less exciting story and a more actionable one.</p>
<h2>The autophagy problem</h2>
<p>Autophagy is real, important, and one of the most over-extrapolated concepts in popular health writing. Most of what is confidently stated about fasting duration and autophagy in humans is extrapolated from rodent work at timescales that do not translate.</p>
<p>Mice have a metabolic rate roughly seven times ours. A sixteen-hour fast in a mouse is not a sixteen-hour fast in a person. When someone gives you a precise hour at which autophagy "switches on," ask where the human data is. There usually is not any.</p>`,
  },
  {
    author: 'amira_z', days: 21,
    title: 'Training Age Matters More Than Actual Age',
    subtitle: 'Why the same programme produces wildly different results in two people with identical birthdays.',
    tags: ['performance'],
    body: `<p>Give the same twelve-week programme to two forty-year-olds. One adds fifteen kilos to their squat. The other adds two and a half and gets injured in week nine.</p>
<p>The variable that predicts this is not age, genetics, or effort. It is how many years each has spent under a barbell.</p>
<h2>Adaptation is front-loaded</h2>
<p>A beginner's first year produces gains that will never be repeated. Most of it is neurological — learning to recruit motor units, coordinate, and brace. The tissue has barely changed. The nervous system has changed enormously.</p>
<p>By year five the neurological gains are banked and progress comes from slow structural change. The programme that produced a fifteen-kilo jump in year one produces two kilos in year six, and this is not a failure of the programme.</p>
<h2>Why this breaks people</h2>
<p>The injury in week nine usually comes from an experienced lifter running a beginner's progression, or a beginner running an advanced one.</p>
<p>Beginner programmes assume you can recover from linear weekly increases, which is true only while the adaptations are neural. Advanced programmes assume you have the tissue tolerance and technical consistency to survive high volume, which a beginner does not.</p>
<p>Match the programme to training age, not to how motivated you feel. Motivation is the thing that gets you into the position to be injured.</p>`,
  },
  {
    author: 'lin_wei', days: 30,
    title: 'The Case for Writing Documentation Before the Code',
    subtitle: 'Not a process recommendation. A thinking tool that happens to leave documentation behind.',
    tags: ['engineering', 'writing'],
    body: `<p>I do not write docs first because I am disciplined. I write them first because it is the cheapest way I know to find out that I do not understand the problem.</p>
<h2>Prose does not let you hand-wave</h2>
<p>Code lets you defer a decision indefinitely. You write a function, you give it a plausible name, and the ambiguity lives inside it quietly for months.</p>
<p>Prose will not do this for you. The moment you try to write "when a user saves a draft, the system…" you discover you do not know what happens if they have two tabs open. In code that question would have surfaced as a bug in November.</p>
<h2>The README test</h2>
<p>Write the README as though the feature exists. Describe how someone uses it, what they pass, what they get back.</p>
<p>If the README is hard to write, the design is wrong. Not "needs polish" — wrong. Difficulty explaining an interface is almost always the interface being difficult, and no amount of implementation skill will fix an API that cannot be described in a paragraph.</p>
<h2>What it costs</h2>
<p>An hour, usually. Occasionally a day, and those are the ones that save a fortnight.</p>
<p>The documentation you end up with is a side effect. Useful, but not the point. The point is that you found the hard question while it was still free to answer.</p>`,
  },
  {
    author: 'danielokoye', pub: 'ascend-lab', days: 45,
    title: 'Sleep Debt Is Not a Bank Account',
    subtitle: 'You cannot repay it on Saturday, and the metaphor is doing real damage to how people plan their weeks.',
    tags: ['health', 'performance', 'longevity'],
    body: `<p>The banking metaphor is comforting and mostly wrong. It implies a ledger — five hours short across the week, sleep five extra on Sunday, balance restored.</p>
<p>Recovery does not work like that, and believing it does leads people to design weeks that never recover.</p>
<h2>What recovers and what does not</h2>
<p>Some functions rebound quickly. Subjective alertness returns close to baseline after one or two long nights, which is precisely the problem — you feel recovered well before you are.</p>
<p>Glucose metabolism and immune markers take considerably longer. Studies of recovery sleep after a week of restriction find some measures still impaired after two nights of extended sleep, even as participants report feeling fine.</p>
<h2>The gap between feeling and function</h2>
<p>This is the part that matters practically. Self-assessed alertness is a poor proxy for performance under restriction. People who are measurably impaired routinely report feeling normal, and the impairment tends to be largest on tasks requiring sustained attention.</p>
<p>You lose the ability to notice, which means you cannot use how you feel to decide whether Saturday was enough.</p>
<h2>What to do instead</h2>
<p>Treat sleep as a constraint rather than a variable. Decide the hours first and fit the week around them.</p>
<p>This sounds like advice nobody can follow, and for some weeks it is. But most chronic short sleep I see is not caused by an immovable obligation. It is caused by treating sleep as the flexible item because it is the only one that does not complain when you take from it.</p>`,
  },
]

async function main() {
  console.log('Resetting…')
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE "Notification","Highlight","ReadingHistory","ListItem","ReadingList",
    "Clap","Response","PostTag","Post","TagFollow","Tag","PublicationMember","Publication",
    "Mute","Follow","Session","User" RESTART IDENTITY CASCADE;
  `)

  const passwordHash = await hash('ascend123')

  const users: Record<string, { id: string }> = {}
  for (const p of PEOPLE) {
    const u = await prisma.user.create({
      data: {
        username: p.username, name: p.name, email: p.email, passwordHash,
        bio: p.bio, isVerified: p.verified ?? false, isMember: true,
        about: `${p.bio} Writing on Ascend.`,
      },
    })
    users[p.username] = u
    await prisma.readingList.create({ data: { userId: u.id, name: 'Reading list', isPrivate: true } })
  }

  const tags: Record<string, { id: string }> = {}
  for (const [slug, name, description] of TAGS) {
    tags[slug] = await prisma.tag.create({ data: { slug, name, description } })
  }

  const pub = await prisma.publication.create({
    data: {
      slug: 'ascend-lab', name: 'The Ascend Lab',
      tagline: 'Evidence over enthusiasm.',
      description: 'Long-form writing on performance, health, and the research behind both.',
      members: {
        create: [
          { userId: users.fakhrul.id, role: 'OWNER' },
          { userId: users.amira_z.id, role: 'EDITOR' },
          { userId: users.danielokoye.id, role: 'WRITER' },
          { userId: users.lin_wei.id, role: 'WRITER' },
        ],
      },
    },
  })

  for (const s of STORIES) {
    const author = users[s.author]
    const publishedAt = new Date(Date.now() - s.days * 86400_000)
    const wc = words(s.body)
    const post = await prisma.post.create({
      data: {
        slug: 'tmp', title: s.title, subtitle: s.subtitle,
        contentHtml: s.body, excerpt: excerpt(s.body),
        wordCount: wc, readingTime: Math.max(1, Math.round(wc / 265)),
        status: 'PUBLISHED', publishedAt, isMemberOnly: s.member ?? false,
        coverImage: `/api/cover/${encodeURIComponent(s.title.slice(0, 40))}`,
        authorId: author.id, publicationId: s.pub ? pub.id : null,
        tags: { create: s.tags.map((t) => ({ tagId: tags[t].id })) },
      },
    })
    await prisma.post.update({ where: { id: post.id }, data: { slug: slugify(s.title, post.id) } })

    // Spread claps and a couple of responses across the other seeded readers.
    const others = Object.values(users).filter((u) => u.id !== author.id)
    for (const u of others) {
      if (Math.random() < 0.8) {
        await prisma.clap.create({
          data: { userId: u.id, postId: post.id, count: 1 + Math.floor(Math.random() * 40) },
        })
      }
    }
    const responders = others.slice(0, 1 + Math.floor(Math.random() * 2))
    for (const r of responders) {
      await prisma.response.create({
        data: {
          postId: post.id, authorId: r.id,
          contentHtml: `<p>${['This lines up with what I have seen in practice.', 'The section on effect sizes is the part most people skip.', 'Saved this one. The framing is useful.'][Math.floor(Math.random() * 3)]}</p>`,
        },
      })
    }
  }

  // A draft so the editor and drafts list have something in them.
  const draft = await prisma.post.create({
    data: {
      slug: 'draft-tmp', title: 'On Measuring the Wrong Thing Carefully',
      contentHtml: '<p>Precision is not the same as accuracy, and a well-calibrated instrument pointed at the wrong quantity will lie to you with great confidence.</p>',
      excerpt: 'Precision is not the same as accuracy…', authorId: users.fakhrul.id, status: 'DRAFT',
    },
  })
  await prisma.post.update({ where: { id: draft.id }, data: { slug: slugify(draft.title, draft.id) } })

  // Follow graph + tag follows
  const ids = Object.values(users).map((u) => u.id)
  for (const a of ids) for (const b of ids) {
    if (a !== b && Math.random() < 0.65) {
      await prisma.follow.create({ data: { followerId: a, followingId: b } }).catch(() => {})
    }
  }
  for (const t of ['performance', 'science', 'building', 'design']) {
    await prisma.tagFollow.create({ data: { userId: users.fakhrul.id, tagId: tags[t].id } }).catch(() => {})
  }

  console.log(`Seeded ${PEOPLE.length} users, ${STORIES.length} stories, 1 draft, 1 publication, ${TAGS.length} tags.`)
  console.log('Sign in as rikaidrawings@gmail.com / ascend123')
}

main().finally(() => prisma.$disconnect())
