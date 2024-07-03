import '@/css/platform/journals/create.css'
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import * as jwt from "jose"
import * as crypto from "crypto"
import { db } from "@/db/db"
import { account } from "@/db/schema"
import { eq } from "drizzle-orm"
import { PlatformNavbar } from '@/components/platform/PlatformNavbar'
import { PlatformSidebar } from '@/components/platform/PlatformSidebar'
import { Button, Checkbox, FileInput, TextInput } from '@mantine/core'
import { UploadPaper } from '@/components/platform/papers/UploadPaper'
import { uploadFiles } from '@/lib/uploadFiles'
import { journalUploadHandler } from '@/lib/journalUploadHandler'

export default async function CreateJournal(args: any) {
    async function createJournalActionHandler(data: FormData) {
        "use server"
        let res = await journalUploadHandler(data)
        // @ts-ignore
        if (res['HORIZON_STATUS'] == 'SUCCESS') {
            // @ts-ignore
            redirect(res['FILE_URL'])
        }
    }
    // Get cookies
    let token = cookies().get('horizon_token')
    if (token == undefined) {
        return redirect('/platform/account')
    }
    // Grabs the JWT
    // @ts-ignore
    let token_info = await jwt.jwtVerify(token['value'], crypto.createSecretKey(process.env.JWT_Secret, 'utf-8'))
    // Since the payload has an email, the email is our identifier.
    let email = token_info['payload']['email']
    // Now we have account information.
    // @ts-ignore
    let account_info = await db.select().from(account).where(eq(account.email, email))
    // grab profile info
    // @ts-ignore
    if (account_info[0].organization == null && account_info[0].image_url == null && account_info[0].first_name == null && account_info[0].last_name == null && account_info[0].user_role == null) {
        if (args['searchParams']['welcome'] == undefined) {
            redirect('/platform/?welcome=true')
        }
    }

    return (
        <div className="container">
            <PlatformNavbar profileInfo={{
                'profile_pic': account_info[0]['image_url'] || '/default_pfp.png',
                'first_name': account_info[0]['first_name'],
                'last_name': account_info[0]['last_name'],
                'organization': account_info[0]['organization'],
                'user_role': account_info[0]['user_role']
            }} />
            <div className="platform_body">
                <PlatformSidebar />
                <main className='platform_content_create_journal'>
                    <div className='page_headers'>
                        <h1>Create a Journal</h1>
                    </div>
                    {/* @ts-ignore */}
                    <form action={createJournalActionHandler} method='post'>
                        <TextInput label="Journal Name" name='journal_name' placeholder='Journal Name' required/>
                        <TextInput label="Journal Description" name='journal_description' placeholder='Journal Description' required/>
                        <TextInput label="Journal Field" name='journal_field' placeholder='Journal Field' required/>
                        <UploadPaper accept="image/*" />
                        <Button type='submit' color='blue'>Create Journal</Button>
                    </form>
                </main>
            </div>
        </div>
    )
}