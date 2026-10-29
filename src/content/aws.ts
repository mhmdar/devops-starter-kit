import { bootSh, helloTxt } from "./files";
import { cmd, expected, file, note, p, ul, warn, type Drill } from "./types";

export const awsDrills: Drill[] = [
  {
    module: "aws",
    slug: "cli-identity",
    number: 1,
    title: "Prove the CLI is you",
    minutes: 30,
    outcome:
      "You can show which account and region the CLI will change, before you create anything that costs money.",
    handIn:
      "aws sts get-caller-identity, with nothing secret in the paste. This command does not print the access key. If the Arn contains :root, stop and fix that before drill 2.",
    steps: [
      {
        id: "aws-cli-1",
        title: "Install AWS CLI v2 and choose the account",
        blocks: [
          p("Install AWS CLI v2 from the official guide: [Installing or updating the latest version of the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html). Then check the version."),
          cmd(`aws --version`),
          expected(`The string starts with aws-cli/2.`),
          p("Use the account your instructor named. A university sandbox or an AWS Academy Learner Lab is the right place. Do not use an employer account. Do not stay signed in as the root user to do the drills."),
          ul([
            "Own account, used only for this course: in the console, create an IAM user for yourself. Attach AmazonEC2FullAccess and AmazonS3FullAccess only if this account holds no other data. If the account holds anything else, stop and ask for a narrower policy. Do not attach AdministratorAccess because a lab sheet mentioned AWS.",
            "Create an access key for the Command Line Interface. Put it into aws configure in the next step, then close the dialog. Do not paste the secret into chat, a slide, a screenshot, or a git repository.",
            "AWS Academy or another lab portal: skip creating a user and skip creating an access key. The portal gives you temporary credentials and a region. Use those. They expire. Do the cleanup drill before they do.",
            "Root user, if you have one: turn on multi-factor authentication, create the IAM user, then sign out of root. Root is not the user for these drills.",
          ]),
          note("If you can open Billing, create a monthly cost budget with an email alert before drill 2. Use the limit your instructor names, or a small limit you would notice. Search the console for Budgets. Sandbox portals often hide billing. In that case the portal's timer is your budget. Free tier terms change. Read [the current AWS Free Tier page](https://aws.amazon.com/free/) and the price shown next to the instance type before you launch anything. This lab uses one t3.micro and one tiny text file."),
        ],
      },
      {
        id: "aws-cli-2",
        title: "Configure a profile, or use the portal's temporary credentials",
        blocks: [
          p("Pick one path. Do not do both."),
          p("Path A, an IAM user you just created. aws configure writes the key into ~/.aws/credentials under the profile name. Leave the key there. Do not copy that file into a project."),
          cmd(`aws configure --profile drillbook`),
          expected(`Access Key ID: the key id from the console
Secret Access Key: the secret, typed once
Default region name: us-east-1, unless your instructor named a different region
Default output format: json`),
          p("Path B, temporary credentials from a lab portal. The portal shows export lines for AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_SESSION_TOKEN. Paste those into this terminal. Do not also set AWS_PROFILE to drillbook. A profile that does not exist would hide the credentials you just exported."),
          note("Use one region for the whole lab. If the portal or your instructor named one, use that everywhere, including the console region selector. If nobody named one, use us-east-1. Resources created in another region are invisible until you switch the console to match, which is how instances get forgotten."),
        ],
      },
      {
        id: "aws-cli-3",
        title: "Write a small file of lab variables and ask who you are",
        blocks: [
          p("Choose a short owner id: letters, digits, and hyphens, no spaces. Your university username is a good choice. It keeps your instance and key pair distinct if the account is shared. Run one of the two blocks below, not both. Replace your-username before you run it. On path B, set AWS_REGION to the region the portal gave you instead of us-east-1."),
          cmd(`export LAB_OWNER="your-username"
export AWS_REGION="us-east-1"
export AWS_PROFILE=drillbook
mkdir -p "$HOME/drillbook-aws"
cat > "$HOME/drillbook-aws/lab-ids.sh" << EOF
export AWS_PROFILE=drillbook
export AWS_REGION=$AWS_REGION
export LAB_OWNER=$LAB_OWNER
EOF
chmod 600 "$HOME/drillbook-aws/lab-ids.sh"
aws sts get-caller-identity`, "Path A, IAM user profile"),
          cmd(`export LAB_OWNER="your-username"
export AWS_REGION="us-east-1"
mkdir -p "$HOME/drillbook-aws"
cat > "$HOME/drillbook-aws/lab-ids.sh" << EOF
export AWS_REGION=$AWS_REGION
export LAB_OWNER=$LAB_OWNER
EOF
chmod 600 "$HOME/drillbook-aws/lab-ids.sh"
aws sts get-caller-identity`, "Path B, lab portal credentials"),
          expected(`{
    "UserId": "...",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/your-name"
}`),
          p("The account number will be yours. The Arn should name an IAM user or a lab role. It should not contain :root. If it says root, you put the root access key into the CLI. Delete that access key in the console, create an IAM user, and configure the profile again."),
          note("Every later AWS drill starts with source \"$HOME/drillbook-aws/lab-ids.sh\" because a new terminal does not inherit these variables. The file holds ids, not the secret key. The secret stays in ~/.aws/credentials or in the portal's temporary environment."),
        ],
      },
      {
        id: "aws-cli-4",
        title: "Confirm the region and that EC2 will answer",
        blocks: [
          cmd(`source "$HOME/drillbook-aws/lab-ids.sh"
aws configure get region || echo "region comes from the environment"
aws ec2 describe-instances --region "$AWS_REGION" \\
  --query 'Reservations[].Instances[].InstanceId' --output text
echo "describe-instances exited $?"`),
          expected(`The region line is the region you chose, or the echo about the environment on path B.
describe-instances prints nothing, or prints instance ids that are already in a shared lab account.
The shell then prints "describe-instances exited 0".`),
          warn("An AccessDenied error means this user cannot call EC2. Stop. Do not attach wider policies in a loop. Ask your instructor. An empty result with exit code 0 means you can list instances and there is nothing to list yet, which is what a fresh personal account should show."),
        ],
      },
    ],
    questions: [
      {
        q: "What does a successful get-caller-identity prove, and what does it not print?",
        a: "It proves the CLI can authenticate, and it shows the account and the user or role. It does not print the secret access key. The Arn is the check that you are not the root user.",
      },
      {
        q: "Why do the drills keep naming a region instead of clicking around the console?",
        a: "EC2 and S3 resources belong to a region. The CLI and the console can quietly point at different ones. One exported region, used in both places, is how you find what you created when it is time to delete it.",
      },
      {
        q: "Why is the owner id in the lab file?",
        a: "A shared classroom account will contain other students' instances. The owner tag and the owner id in the name are how you recognize yours. In a personal account it still makes the cleanup commands specific.",
      },
    ],
    mistakes: [
      "Configuring the root access key. The Arn check is there to catch this before you launch anything.",
      "Setting AWS_PROFILE=drillbook on an Academy lab whose credentials are already in the environment. The profile then shadows the session token.",
      "Putting the secret key into lab-ids.sh, a screenshot, or this git repository. lab-ids.sh is for region, owner, and later the instance id.",
      "Continuing after AccessDenied by switching to AdministratorAccess in an account that is not a dedicated sandbox.",
    ],
    checkpoint:
      "get-caller-identity succeeds, the Arn is not root, and describe-instances exits 0 in the region you will use for the rest of the session.",
  },
  {
    module: "aws",
    slug: "ec2-instance",
    number: 2,
    title: "Launch a machine and log in",
    minutes: 50,
    outcome:
      "You can launch a t3.micro, connect with a key that stays on your laptop, and stop the instance before you leave it.",
    handIn:
      "The SSH session showing the boot file, and describe-instances printing stopped. Do not hand in the .pem file or its contents.",
    steps: [
      {
        id: "aws-ec2-1",
        title: "Load the lab variables and find today's Amazon Linux AMI",
        blocks: [
          warn("This drill starts a virtual machine. Finish the stop at the end, and do the cleanup drill before you are done for the day. A stopped instance still stores a disk. Terminate is what deletes it, and that is drill 4. Confirm the hourly price in the console before you launch if you are unsure whether this account's credits or free tier cover a t3.micro."),
          cmd(`source "$HOME/drillbook-aws/lab-ids.sh"
AMI=$(aws ssm get-parameter --region "$AWS_REGION" \\
  --name /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 \\
  --query 'Parameter.Value' --output text)
echo "$AMI"`),
          expected(`ami- followed by 17 hexadecimal characters. The id changes when Amazon publishes a new image. Yours does not need to match a classmate's.`),
          p("That parameter is a public alias AWS maintains for the current Amazon Linux 2023 image. You do not hard-code an AMI id from a blog post, because those go stale."),
        ],
      },
      {
        id: "aws-ec2-2",
        title: "Create a key pair and a security group that allows SSH from your IP only",
        blocks: [
          p("The private key is a secret. It will be written to a file in your home directory. Do not commit it, do not email it, and do not paste it into the lab report."),
          cmd(`aws ec2 create-key-pair --region "$AWS_REGION" \\
  --key-name "drillbook-$LAB_OWNER" \\
  --query 'KeyMaterial' --output text > "$HOME/drillbook-lab.pem.tmp"
head -n 1 "$HOME/drillbook-lab.pem.tmp"
mv "$HOME/drillbook-lab.pem.tmp" "$HOME/drillbook-lab.pem"
chmod 400 "$HOME/drillbook-lab.pem"`),
          expected(`The first line of the temp file is -----BEGIN RSA PRIVATE KEY----- or -----BEGIN OPENSSH PRIVATE KEY-----.`),
          warn("If create-key-pair fails, delete the temp file before you retry. An empty redirect target is not a key. If the error says the key name already exists, that name is yours from an earlier attempt only if you created it. aws ec2 delete-key-pair --region \"$AWS_REGION\" --key-name \"drillbook-$LAB_OWNER\" removes it. Do not delete a key name you do not recognize."),
          cmd(`MYIP=$(curl -fsS https://checkip.amazonaws.com | tr -d '\\n')
echo "$MYIP"
SG=$(aws ec2 create-security-group --region "$AWS_REGION" \\
  --group-name "drillbook-$LAB_OWNER" \\
  --description "SSH from my current IP only" \\
  --query 'GroupId' --output text)
aws ec2 authorize-security-group-ingress --region "$AWS_REGION" \\
  --group-id "$SG" \\
  --protocol tcp --port 22 --cidr "$MYIP/32"
echo "$SG"`),
          expected(`MYIP is a dotted address, not a range.
The security group id starts with sg-.
The authorize command returns JSON including the rule you added, or it exits 0 on a CLI that prints nothing.`),
          p("The /32 means this one address. 0.0.0.0/0 would mean every address on the internet, and this lab does not use it. If your campus NAT address changes later and SSH starts timing out, add your new address the same way. Do not widen the rule to the world as the first fix."),
          note("create-security-group uses the default VPC when you do not pass a VPC id. If the error says there is no default VPC, stop and ask. Do not click through a custom network for this lab."),
        ],
      },
      {
        id: "aws-ec2-3",
        title: "Launch the instance with a one-line boot script",
        blocks: [
          p("Save this as ~/drillbook-aws/boot.sh. User data runs as root on first boot. This script writes one file so you can prove the boot happened. Do not put a secret in user data. It is retrievable later by anyone who can call the EC2 API for this instance."),
          file("aws/boot.sh", bootSh),
          cmd(`INSTANCE=$(aws ec2 run-instances --region "$AWS_REGION" \\
  --image-id "$AMI" \\
  --instance-type t3.micro \\
  --key-name "drillbook-$LAB_OWNER" \\
  --security-group-ids "$SG" \\
  --count 1 \\
  --user-data "file://$HOME/drillbook-aws/boot.sh" \\
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=drillbook-$LAB_OWNER},{Key=Project,Value=drillbook},{Key=Owner,Value=$LAB_OWNER}]" \\
  --query 'Instances[0].InstanceId' --output text)
echo "$INSTANCE"
cat > "$HOME/drillbook-aws/lab-ids.sh" << EOF
export AWS_REGION=$AWS_REGION
export LAB_OWNER=$LAB_OWNER
export INSTANCE=$INSTANCE
export SG=$SG
EOF
if [ -n "$AWS_PROFILE" ]; then
  printf '%s\\n' "export AWS_PROFILE=$AWS_PROFILE" >> "$HOME/drillbook-aws/lab-ids.sh"
fi
chmod 600 "$HOME/drillbook-aws/lab-ids.sh"`),
          p("Path A already has AWS_PROFILE in the environment, so the if keeps it in the file. Path B has no profile, and the if writes nothing. That is what you want."),
          expected(`The instance id starts with i-.
lab-ids.sh now contains INSTANCE and SG.`),
          note("If the API rejects t3.micro, repeat the run with t2.micro. Both are enough for this lab. If the error says you are not allowed to launch, the sandbox has a limit. Use the type your instructor named. Do not retry in a loop."),
        ],
      },
      {
        id: "aws-ec2-4",
        title: "Wait for a public address and log in",
        blocks: [
          cmd(`source "$HOME/drillbook-aws/lab-ids.sh"
aws ec2 wait instance-running --region "$AWS_REGION" --instance-ids "$INSTANCE"
PUBLIC_IP=$(aws ec2 describe-instances --region "$AWS_REGION" \\
  --instance-ids "$INSTANCE" \\
  --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
echo "$PUBLIC_IP"
ssh -i "$HOME/drillbook-lab.pem" -o StrictHostKeyChecking=accept-new "ec2-user@$PUBLIC_IP"`),
          expected(`PUBLIC_IP is a dotted address.
SSH connects. The prompt looks like a shell on an Amazon Linux host.`),
          p("accept-new records the host key on first connection. That is reasonable here because you just created the machine. Do not turn host-key checking off in your SSH config. The username for Amazon Linux 2023 is ec2-user. ubuntu would be the username for an Ubuntu image, and it will fail against this one."),
          warn("If PUBLIC_IP prints None, the subnet did not assign a public address. Stop and ask. Do not allocate an Elastic IP. An unattached Elastic IP is a separate charge, and this lab does not need one. If SSH waits and then times out, check that the security group allows port 22 from the IP printed by checkip.amazonaws.com, that the instance state is running, and that the username is ec2-user. A changed campus IP is a common cause. Add the new /32. Do not replace it with 0.0.0.0/0."),
          p("On the instance:"),
          cmd(`head -n 3 /etc/os-release
cat /var/tmp/drillbook.txt
exit`),
          expected(`The os-release lines name Amazon Linux.
cat prints boot-ok.
exit returns you to your laptop.`),
          note("If the file is missing, cloud-init has not finished the user-data script. Wait twenty seconds and cat again. Do not re-launch the instance to hurry it up."),
        ],
      },
      {
        id: "aws-ec2-5",
        title: "Stop the instance",
        blocks: [
          p("Stop frees the instance from running charges. It does not delete the disk. Drill 4 terminates it. Do this before you close the laptop, even if you plan to come back later today."),
          cmd(`source "$HOME/drillbook-aws/lab-ids.sh"
aws ec2 stop-instances --region "$AWS_REGION" --instance-ids "$INSTANCE"
aws ec2 wait instance-stopped --region "$AWS_REGION" --instance-ids "$INSTANCE"
aws ec2 describe-instances --region "$AWS_REGION" --instance-ids "$INSTANCE" \\
  --query 'Reservations[0].Instances[0].State.Name' --output text`),
          expected(`stopped`),
          p("The waiter can sit there for a minute or two. That is the command waiting, not a hung terminal. Stopped means you can start the same instance again later. Terminated means it is going away. The cleanup drill is the one that terminates."),
        ],
      },
    ],
    questions: [
      {
        q: "What is the difference between the image id, the instance id, and the key pair?",
        a: "The AMI is the template Amazon Linux was built from. The instance id names the virtual machine you launched from it. The key pair is the credential SSH accepts. Deleting the key file on your laptop does not delete the instance. Stopping the instance does not delete the key.",
      },
      {
        q: "Why is the security group a /32 and not 0.0.0.0/0?",
        a: "Port 22 is the admin login. A /32 allows one address, the one you had when you created the rule. 0.0.0.0/0 allows the whole IPv4 internet to attempt that login. The key is a real secret, and the lab still does not open the port to everyone.",
      },
      {
        q: "What does a stopped instance still cost, and what does terminate change?",
        a: "Stop ends compute charges for the instance. The root disk usually remains, and storage is billed until the instance is terminated and that disk is deleted. Drill 4 is that step. This lab does not use an Elastic IP.",
      },
    ],
    mistakes: [
      "SSH as ubuntu or root. This image uses ec2-user.",
      "A .pem that is group-readable. SSH refuses it. chmod 400 is the fix. If the first line of the file is not a BEGIN line, the create-key-pair command failed and the file is not a key.",
      "Launching a second instance because the first SSH attempt failed. Look at the security group and the username first. Two forgotten instances are a worse afternoon than one slow login.",
      "Leaving the instance running because stop and terminate sound similar. Stop now. Terminate in drill 4, after you have the id written down.",
    ],
    checkpoint:
      "You logged in as ec2-user, read boot-ok, exited, and describe-instances prints stopped for the instance id in lab-ids.sh.",
  },
  {
    module: "aws",
    slug: "s3-presign",
    number: 3,
    title: "A private file and a link that expires",
    minutes: 40,
    outcome:
      "You can store an object, keep the bucket closed to the public, and hand out a link that stops working.",
    handIn:
      "The 403 from the bare object URL. Say whether the presigned link loaded. Do not paste a presigned URL that is still valid. It contains a signature.",
    steps: [
      {
        id: "aws-s3-1",
        title: "Create a bucket with a unique name and block public access",
        blocks: [
          warn("One small text file is cheap. A bucket left open to the world is the mistake this drill is about. The bare URL at the end of the main steps should return 403. Do not finish while it returns 200."),
          cmd(`source "$HOME/drillbook-aws/lab-ids.sh"
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
BUCKET="drillbook-$ACCOUNT-$(date +%s)"
echo "$BUCKET"
if [ "$AWS_REGION" = "us-east-1" ]; then
  aws s3api create-bucket --bucket "$BUCKET" --region "$AWS_REGION"
else
  aws s3api create-bucket --bucket "$BUCKET" --region "$AWS_REGION" \\
    --create-bucket-configuration "LocationConstraint=$AWS_REGION"
fi
aws s3api put-public-access-block --bucket "$BUCKET" --region "$AWS_REGION" \\
  --public-access-block-configuration \\
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
printf '%s\\n' "export BUCKET=$BUCKET" >> "$HOME/drillbook-aws/lab-ids.sh"`),
          expected(`create-bucket returns JSON with the bucket name, or a Location field.
put-public-access-block exits 0 and usually prints nothing.`),
          p("Bucket names are global. The account id and the timestamp keep yours from colliding. us-east-1 is the original region and rejects the location constraint that every other region requires. That is what the if is for. New buckets already block public access in current accounts. The command sets the switch explicitly so you can see it."),
        ],
      },
      {
        id: "aws-s3-2",
        title: "Upload one object and list it with your credentials",
        blocks: [
          p("Save this as ~/drillbook-aws/hello.txt, or copy student-labs/aws/hello.txt."),
          file("aws/hello.txt", helloTxt),
          cmd(`source "$HOME/drillbook-aws/lab-ids.sh"
aws s3 cp "$HOME/drillbook-aws/hello.txt" "s3://$BUCKET/hello.txt" --region "$AWS_REGION"
aws s3 ls "s3://$BUCKET/" --region "$AWS_REGION"`),
          expected(`upload: hello.txt to s3://.../hello.txt
The listing shows hello.txt and a small size.`),
          p("aws s3 ls works because it sends your credentials. That is a different door from a URL someone pastes into a browser."),
        ],
      },
      {
        id: "aws-s3-3",
        title: "Show that the bare URL is closed, then open a link that expires",
        blocks: [
          cmd(`source "$HOME/drillbook-aws/lab-ids.sh"
if [ "$AWS_REGION" = "us-east-1" ]; then
  URL="https://$BUCKET.s3.amazonaws.com/hello.txt"
else
  URL="https://$BUCKET.s3.$AWS_REGION.amazonaws.com/hello.txt"
fi
echo "$URL"
curl -s -o /dev/null -w '%{http_code}\\n' "$URL"
aws s3 presign "s3://$BUCKET/hello.txt" --expires-in 120 --region "$AWS_REGION"`),
          expected(`curl prints 403.
presign prints one long https URL.`),
          p("Open the presigned URL in a browser now. You should see the two lines of the text file. Wait two minutes and reload it. It should fail. The signature in the query string is what made the first load work, and the expiry is what makes the second load fail. Anyone with that URL can read the object until it expires, so treat a live presigned URL like a short-lived secret. Do not put it in a public channel."),
          note("A 403 on the bare URL together with a working presigned URL is the result you want. If the bare URL returns 200, public access is on. Stop and do the lockdown commands in the stretch section before you continue, even if you did not mean to open the bucket."),
        ],
      },
    ],
    questions: [
      {
        q: "Why did the bare URL return 403 while aws s3 ls worked?",
        a: "The CLI call was signed with your credentials. The bare URL was an anonymous request. Block Public Access, and the absence of a public policy, make the anonymous request fail. Owning the bucket does not make its URLs public.",
      },
      {
        q: "What is in a presigned URL that makes it temporary?",
        a: "A signature and an expiry, carried in the query string. The signature was made with your credentials. After the expiry, the same URL no longer authorizes the read. It is not a separate copy of the file.",
      },
      {
        q: "Why is Block Public Access a separate switch from a bucket policy?",
        a: "A bucket policy can say the world may read an object. Block Public Access can stop that grant from taking effect, even if the policy is still stored. You want both the policy gone and the block switched on before you leave.",
      },
    ],
    mistakes: [
      "Naming the bucket with an underscore, a capital letter, or a space. S3 bucket names are lowercase and hyphenated. The command in the drill already follows that.",
      "Creating the bucket in a different region from $AWS_REGION, then looking for it in the wrong place in the console. The if statement exists because us-east-1 is the exception.",
      "Treating a 200 on the bare URL as success. For this lab, 200 on that URL means you still have a public object.",
      "Pasting a live presigned URL into a shared document. Wait until it has expired, or describe the result in words.",
    ],
    checkpoint:
      "aws s3 ls shows hello.txt, the bare URL returns 403, and the presigned URL loaded before it expired.",
    stretch: {
      title: "Stretch: one public object, then lock it again",
      blocks: [
        p("Do this only if your instructor assigned it. The point is to make a single object readable, not to make the bucket listable, and to put the lock back before you tick anything off. Skip it if it was not assigned. The main checkpoint already stands."),
        warn("The policy below allows s3:GetObject on one key. It does not allow s3:ListBucket, and it does not allow s3:*. A star on the action, or a star on the whole bucket, is not the stretch. It is a different and worse change."),
        cmd(`source "$HOME/drillbook-aws/lab-ids.sh"
aws s3api put-public-access-block --bucket "$BUCKET" --region "$AWS_REGION" \\
  --public-access-block-configuration \\
  BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false
cat > "$HOME/drillbook-aws/hello-public.json" << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadHelloOnly",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET/hello.txt"
    }
  ]
}
EOF
aws s3api put-bucket-policy --bucket "$BUCKET" --region "$AWS_REGION" \\
  --policy "file://$HOME/drillbook-aws/hello-public.json"`),
        p("Curl the same bare URL as before. This time you want 200, and the body should be the text file. Then put the lock back. Both commands are required."),
        cmd(`source "$HOME/drillbook-aws/lab-ids.sh"
aws s3api delete-bucket-policy --bucket "$BUCKET" --region "$AWS_REGION"
aws s3api put-public-access-block --bucket "$BUCKET" --region "$AWS_REGION" \\
  --public-access-block-configuration \\
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true`),
        p("Curl the bare URL again. It must be 403 before you leave the drill. If you skip the stretch, it should already be 403 from the main steps."),
      ],
    },
  },
  {
    module: "aws",
    slug: "cleanup",
    number: 4,
    title: "End with nothing left running",
    minutes: 25,
    outcome:
      "You can list what you created and delete it, and you can show the commands that prove it is gone.",
    handIn:
      "The four checks at the end: no instance in a live state, the security group missing, the key pair missing, and the bucket missing. This output is the assignment.",
    steps: [
      {
        id: "aws-cleanup-1",
        title: "Load your ids and look only at your own rows",
        blocks: [
          warn("This drill is part of the assignment. In a shared account, terminate and delete only the resources whose ids are in your lab-ids.sh, or whose Owner tag is your LAB_OWNER. If a list shows an instance you do not recognize, leave it and ask. Do not write a loop that deletes every name starting with drillbook."),
          cmd(`source "$HOME/drillbook-aws/lab-ids.sh"
echo "owner=$LAB_OWNER"
echo "instance=$INSTANCE"
echo "security_group=$SG"
echo "bucket=$BUCKET"
aws ec2 describe-instances --region "$AWS_REGION" \\
  --filters "Name=tag:Project,Values=drillbook" "Name=tag:Owner,Values=$LAB_OWNER" \\
  --query 'Reservations[].Instances[].{Id:InstanceId,State:State.Name,Type:InstanceType}' \\
  --output table`),
          expected(`The echoed instance id matches the Id column.
The state is stopped, stopping, or running. If you already terminated it, the state may be terminated or the table may be empty.`),
          p("If INSTANCE is empty because the shell file was lost, copy the Id from the table, the one with your owner tag, and export INSTANCE to that value. If the table has more than one row, stop and look. Do not terminate the list."),
        ],
      },
      {
        id: "aws-cleanup-2",
        title: "Terminate the instance and wait until it is gone",
        blocks: [
          p("Terminate is not stop. After this, the instance does not start again, and the default root volume is deleted with it. The waiter can take a couple of minutes. Leave it."),
          cmd(`source "$HOME/drillbook-aws/lab-ids.sh"
aws ec2 terminate-instances --region "$AWS_REGION" --instance-ids "$INSTANCE"
aws ec2 wait instance-terminated --region "$AWS_REGION" --instance-ids "$INSTANCE"
aws ec2 describe-instances --region "$AWS_REGION" --instance-ids "$INSTANCE" \\
  --query 'Reservations[0].Instances[0].State.Name' --output text`),
          expected(`terminated`),
          note("If you never launched an instance, skip this step. If terminate says the id does not exist, you are already done with the instance. Write that down and continue with the security group."),
        ],
      },
      {
        id: "aws-cleanup-3",
        title: "Delete the security group, the key pair, and the local private key",
        blocks: [
          p("The security group cannot be deleted while an instance is still using it, including while that instance is shutting-down. That is why the waiter comes first."),
          cmd(`source "$HOME/drillbook-aws/lab-ids.sh"
aws ec2 delete-security-group --region "$AWS_REGION" --group-id "$SG"
aws ec2 delete-key-pair --region "$AWS_REGION" --key-name "drillbook-$LAB_OWNER"
rm -f "$HOME/drillbook-lab.pem" "$HOME/drillbook-lab.pem.tmp"`),
          expected(`Both delete commands exit 0.
ls of the pem file fails because the file is gone.`),
          p("Deleting the key pair in AWS does not delete the file on your laptop, and deleting the file does not delete the key pair in AWS. You do both. The private key is no longer useful once the instance is terminated. Do not archive it \"in case\"."),
        ],
      },
      {
        id: "aws-cleanup-4",
        title: "Empty the bucket and delete the bucket",
        blocks: [
          p("S3 will not delete a bucket that still has objects. Empty it, then remove the bucket. --recursive here means every object in this one bucket. It does not mean every bucket in the account. There is no command in this drill that loops over aws s3 ls."),
          cmd(`source "$HOME/drillbook-aws/lab-ids.sh"
aws s3 rm "s3://$BUCKET" --recursive --region "$AWS_REGION"
aws s3 rb "s3://$BUCKET" --region "$AWS_REGION"`),
          expected(`delete: s3://.../hello.txt
remove_bucket: s3://...`),
          note("If you skipped the S3 drill, BUCKET is empty and these commands should not be run against a blank name. Skip this step and say so in the hand-in. If the bucket is already gone, the error says it does not exist, and you are done with S3."),
        ],
      },
      {
        id: "aws-cleanup-5",
        title: "Prove it, including the things this lab told you not to create",
        blocks: [
          cmd(`source "$HOME/drillbook-aws/lab-ids.sh"
echo "--- instances ---"
aws ec2 describe-instances --region "$AWS_REGION" \\
  --filters "Name=tag:Owner,Values=$LAB_OWNER" \\
    "Name=instance-state-name,Values=pending,running,stopping,stopped" \\
  --query 'Reservations[].Instances[].InstanceId' --output text
echo "--- security group (NotFound is success) ---"
aws ec2 describe-security-groups --region "$AWS_REGION" --group-ids "$SG"
echo "--- key pair (NotFound is success) ---"
aws ec2 describe-key-pairs --region "$AWS_REGION" --key-names "drillbook-$LAB_OWNER"
echo "--- bucket (NotFound or 404 is success) ---"
aws s3api head-bucket --bucket "$BUCKET" --region "$AWS_REGION"
echo "--- elastic IPs ---"
aws ec2 describe-addresses --region "$AWS_REGION" \\
  --query 'Addresses[].PublicIp' --output text`),
          expected(`The instance query prints nothing.
The security group command fails with InvalidGroup.NotFound.
The key pair command fails with InvalidKeyPair.NotFound.
head-bucket fails because the bucket does not exist.
describe-addresses prints nothing in a personal account.`),
          p("In a shared account, describe-addresses may list addresses other people allocated. Do not release an address that is not yours. This lab never allocates one, so your own set should be empty. If you allocated one while clicking, release only that allocation id, then ask if you are not sure which one it is."),
          note("A NotFound error on the group, the key, and the bucket is the success condition. A quiet empty list is the success condition for instances. Screenshot or paste this output for your instructor. It should contain ids you already know, not a secret key."),
        ],
      },
    ],
    questions: [
      {
        q: "Why can't you delete the security group first?",
        a: "The instance's network interface still references it until the instance has terminated. AWS returns a dependency error. The waiter is the reliable order, not a second click.",
      },
      {
        q: "What does a stopped instance still cost that a terminated one does not?",
        a: "The root volume. Stop released the virtual machine. Terminate, for this Amazon Linux launch, also deletes that volume. Leaving a stopped lab instance until next month is a storage bill and a machine you forgot about.",
      },
      {
        q: "What should you do if the instance table shows a row with no Owner tag that you do not recognize?",
        a: "Leave it. Ask the instructor. The cleanup commands in this drill take an id you saved, or a row with your owner tag. They are not a sweep of the account.",
      },
    ],
    mistakes: [
      "Running aws s3 rb on a bucket name you typed from memory and mistyped onto someone else's bucket. Use the BUCKET variable from lab-ids.sh. The head-bucket check is for that same variable.",
      "Deleting a security group or key pair whose name you did not create. The names in this lab contain your LAB_OWNER.",
      "Treating stop as the end of the lab. If describe-instances still shows stopped, you are not finished.",
      "A for-loop over every drillbook resource in a shared account. Do not write one. The class is in that account with you.",
    ],
    checkpoint:
      "No instance with your owner tag is pending, running, stopping, or stopped. The security group, key pair, and bucket each come back NotFound. The .pem file is gone from your home directory.",
  },
];
