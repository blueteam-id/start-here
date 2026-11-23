// Plain-language glossary of terms the lessons use. Keep definitions to one
// or two short sentences, written for a complete beginner. `track` is the
// track that teaches the term properly; the glossary page links to it.

export interface GlossaryTerm {
  term: string;
  definition: string;
  track: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  { term: 'Absolute path', definition: 'A file path that starts at the top of the filesystem (`/` on Linux and macOS, a drive like `C:\\` on Windows), so it always means the same place.', track: 'linux-essentials' },
  { term: 'Access Control List (ACL)', definition: 'The list of who may do what to a file or folder on Windows (NTFS). Each entry names one user or group and the exact rights they get.', track: 'windows-foundations' },
  { term: 'Active Directory (AD)', definition: 'The Microsoft system most companies use to manage every user, computer, and rule in one place. Attackers prize it because one powerful account can reach everything.', track: 'windows-foundations' },
  { term: 'Architecture (CPU)', definition: 'The instruction "language" a processor understands, most often x86_64 (Intel and AMD) or arm64 (phones, Apple Silicon). Programs built for one do not run natively on the other.', track: 'computing-basics' },
  { term: 'Branch', definition: 'A movable name pointing at a commit in Git. Branches let you try changes without touching `main` until you merge them.', track: 'git-fundamentals' },
  { term: 'CI/CD', definition: 'Continuous integration and delivery: automation that runs tests, builds, or deployments every time code changes. It often holds real secrets, which makes it a target.', track: 'github-gitlab-fundamentals' },
  { term: 'Commit', definition: 'A saved snapshot of files in Git, with an author, a time, a message, and a link to the snapshot before it.', track: 'git-fundamentals' },
  { term: 'Container', definition: 'A packaged application that shares the host\'s kernel instead of bringing its own. Lighter than a virtual machine, with weaker isolation.', track: 'computing-basics' },
  { term: 'CPU', definition: 'The processor: the part of a computer that runs instructions, billions of small steps per second.', track: 'computing-basics' },
  { term: 'Distro (distribution)', definition: 'A complete Linux system: the Linux kernel plus tools, a package manager, and default settings. Ubuntu, Debian, and Fedora are distros.', track: 'linux-essentials' },
  { term: 'Domain controller', definition: 'The Windows server that runs Active Directory and decides who can log in to which computer in a company.', track: 'windows-foundations' },
  { term: 'Dotfile', definition: 'A file whose name starts with a dot, like `.bashrc`. Hidden by default, which is why attackers sometimes use such names.', track: 'linux-essentials' },
  { term: 'Event ID', definition: 'The number Windows gives each kind of logged event. For example, 4625 is a failed logon and 1102 means the Security log was cleared.', track: 'windows-foundations' },
  { term: 'Fork', definition: 'Your own copy of someone else\'s repository on GitHub or GitLab, used to propose changes to a project you cannot write to.', track: 'github-gitlab-fundamentals' },
  { term: 'Hypervisor', definition: 'Software that creates and runs virtual machines, such as VirtualBox, VMware, Hyper-V, or KVM.', track: 'computing-basics' },
  { term: 'Kernel', definition: 'The core of an operating system. It controls the hardware and decides which program gets the CPU, memory, and files.', track: 'computing-basics' },
  { term: 'Lateral movement', definition: 'An attacker spreading from the first computer they reach to other computers in the same network.', track: 'windows-foundations' },
  { term: 'Least privilege', definition: 'Giving every user, program, and file only the access it really needs, and nothing more.', track: 'linux-essentials' },
  { term: 'Merge conflict', definition: 'What happens when two Git branches changed the same lines differently. Git stops and asks a human to decide.', track: 'git-fundamentals' },
  { term: 'Package manager', definition: 'A tool that installs, updates, and removes software and keeps track of it, such as `apt`, `dnf`, or Homebrew.', track: 'linux-essentials' },
  { term: 'Permission string', definition: 'The `-rwxr-xr--` part of `ls -l` on Linux and macOS: who (owner, group, others) may read, write, or run a file.', track: 'linux-essentials' },
  { term: 'Persistence', definition: 'Anything that makes malware start again after a reboot, such as an entry in a Windows Run key.', track: 'windows-foundations' },
  { term: 'Personal access token (PAT)', definition: 'A password-like key for one purpose, with limited permissions and an expiry date, used instead of your password for Git and APIs.', track: 'github-gitlab-fundamentals' },
  { term: 'PID', definition: 'Process ID: the unique number the operating system gives each running process.', track: 'linux-essentials' },
  { term: 'Pipe', definition: 'The `|` symbol, which sends one command\'s output into the next command. Linux pipes pass text; PowerShell pipes pass objects.', track: 'linux-essentials' },
  { term: 'Privilege escalation', definition: 'Going from a low level of access to a higher one, for example from an ordinary user to root or administrator.', track: 'windows-foundations' },
  { term: 'Process', definition: 'A running copy of a program, with its own memory and its own PID.', track: 'computing-basics' },
  { term: 'Pull request (merge request)', definition: 'A proposal to merge one branch into another, shown as a diff that others can review and discuss first.', track: 'github-gitlab-fundamentals' },
  { term: 'RAM', definition: 'Memory: the fast, short-term workspace where running programs keep their data. It is emptied when the power goes off.', track: 'computing-basics' },
  { term: 'Registry', definition: 'The database where Windows keeps its settings, including which programs start automatically.', track: 'windows-foundations' },
  { term: 'Relative path', definition: 'A file path that starts from the folder you are in now, like `notes` or `../notes`.', track: 'linux-essentials' },
  { term: 'Remote', definition: 'A named link from your Git repository to another copy of it, usually on GitHub or GitLab. The default name is `origin`.', track: 'github-gitlab-fundamentals' },
  { term: 'Repository', definition: 'A project tracked by Git, including the full history of every change.', track: 'git-fundamentals' },
  { term: 'Root', definition: 'The all-powerful superuser on Linux and macOS. A `#` at the end of the prompt means you are root.', track: 'linux-essentials' },
  { term: 'Shell', definition: 'The program that reads the commands you type and asks the operating system to run them, such as bash, zsh, or PowerShell.', track: 'linux-essentials' },
  { term: 'Staging area', definition: 'The place in Git where you collect changes before committing them, with `git add`.', track: 'git-fundamentals' },
  { term: 'Storage', definition: 'Long-term memory (SSD or hard disk) that keeps files when the power is off. Slower than RAM.', track: 'computing-basics' },
  { term: 'System call', definition: 'A formal request a program makes to the kernel, for example to read a file or send network data.', track: 'computing-basics' },
  { term: 'UAC (User Account Control)', definition: 'The Windows prompt that asks you to approve an action that needs administrator rights.', track: 'windows-foundations' },
  { term: 'Virtual machine (VM)', definition: 'A complete pretend computer running as software inside a real one, with its own operating system.', track: 'computing-basics' },
  { term: 'WSL', definition: 'Windows Subsystem for Linux: a real Linux environment that runs inside Windows.', track: 'linux-essentials' },
];

/** Stable anchor id for a term, e.g. "Pull request (merge request)" -> "pull-request-merge-request". */
export function termId(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
