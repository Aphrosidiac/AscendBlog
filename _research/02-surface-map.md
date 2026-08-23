# Medium surface map (verified in Chrome, 2026-08-23)

## Global chrome
- Top bar h=64: hamburger, wordmark, search pill (w~193 h~40 bg #f9f9f9 radius 20),
  right: "Get app" black pill, "Write" (pencil+label), bell, avatar(32)
- Left rail w=195, sticky: Home, Library, Profile, Stories, Stats | Following | "Find writers..." + See suggestions
  - active item has 2px left indicator bar
- Promo strip (yellow #ffc017) under header on some pages
- Right rail w=~250 starting x~1160, separated by 1px border, sticky

## Layout widths
- Article read column: **680px**
- Editor column: **700px**
- Feed/list/settings content column: ~556px + right rail
- Feed card image: 200x134 right-aligned thumbnail

## Type scale (measured)
| role | font | size/lh | weight | tracking |
|---|---|---|---|---|
| story h1 | sohne | 42/52 | 700 | -0.011em |
| story h2 (section) | sohne | 24/30 | 600 | -0.016em |
| story body p | source-serif-pro | 20/32 | 400 | -0.003em |
| editor title | title font | 42/52.5 | 400 | — |
| editor body | serif | 21/33.2 | 400 | — |
| feed card title | sohne | 20/24 | 700 | — |
| meta/byline | sohne | 13-14 | 400 | — |

## Pages
| route | contents |
|---|---|
| `/` (out) | hero "Human stories & ideas", Start reading CTA, nav: Our story/Membership/Write/Sign in/Get started, footer links |
| `/` (in) | tabs For you / Featured (+followed tags), feed cards, right rail: writing promo, Staff Picks, Recommended topics, Who to follow, footer links |
| `/@user/slug` | tags row, h1, byline(avatar, name, Follow, read time, date), action bar (clap, responses, repost, bookmark, listen, share, more), body, TOC button (left float), sticky mini-header on scroll, footer author card, More from, Recommended |
| `/new-story` | wordmark + "Draft", Publish pill, ... menu, bell, avatar; Title / Tell your story; + menu (image, unsplash, video, embed, code, new part); bubble toolbar (B i link H1 H2 quote pullquote note) |
| `/me/lists` | "Your library" + New list; tabs: Your lists, Saved lists, Highlights, Reading history, Responses |
| `/me/notifications` | "Notifications"; tabs All / Responses; empty state "You're all caught up." |
| `/me/settings` | "Settings"; tabs: Account, Publishing, Privacy, Notifications, Membership and payment, Security and apps; row = label+desc / value+chevron |
| `/me/stats` | story stats table, views/reads/claps |
| `/@user` | profile header, tabs Home/Lists/About, right rail author card + following |
| `/tag/x` | topic header, follow, story list |
| `/search?q=` | tabs Stories/People/Publications/Topics/Lists |

## Interactions to replicate
clap (hold to repeat, cap 50) · bookmark→"save to list" popover · follow/unfollow toggle ·
text-selection popover (highlight, respond, share) · TOC drawer · responses drawer ·
share menu · more menu (mute, report, block) · listen/TTS · repost · dark mode toggle
