'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAccount } from 'jazz-react';
import {
   createNewOrganization,
} from '@/lib/jazz-schema';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from '@/components/ui/form';
import { generateSlug } from '@/lib/utils';

const formSchema = z.object({
   workspaceName: z.string().min(2, {
      message: 'Workspace name must be at least 2 characters.',
   }),
   workspaceUrl: z.string().min(2, {
      message: 'Workspace URL must be at least 2 characters.',
   }),
});

export default function NewOrgPage() {
   const router = useRouter();
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [error, setError] = useState<string | null>(null);

   // Get account with organizations list
   const { me } = useAccount();
   const organizations = me?.root?.organizations;

   const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         workspaceName: '',
         workspaceUrl: '',
      },
   });

   const onSubmit = async (values: z.infer<typeof formSchema>) => {
      setIsSubmitting(true);
      setError(null);

      try {
         // Generate a slug from the URL field or the name
         const orgSlug = generateSlug(values.workspaceUrl.trim() || values.workspaceName.trim());

         // Check if organization with this slug already exists
         const existingOrg = organizations?.find((org) => org?.slug === orgSlug);
         if (existingOrg) {
            setError('An organization with this URL already exists');
            setIsSubmitting(false);
            return;
         }

         const newOrganization = createNewOrganization(me, {
            teamName: values.workspaceName.trim(),
            orgName: values.workspaceName.trim(),
            orgSlug: orgSlug,
         });

         // Add to organizations list
         organizations?.push(newOrganization);

         // Redirect to the new organization
         router.push(`/${orgSlug}/team/${orgSlug}/issues`);
      } catch (error) {
         console.error('Error creating workspace:', error);
         setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
         {/* Header with back link and login info */}
         <div className="w-full flex justify-between items-center p-6">
            <a href="#" className="text-primary flex items-center" onClick={() => router.push('/')}>
               <span className="text-sm">&larr; Back</span>
            </a>

            <div className="text-muted-foreground text-sm text-right">
               Logged in as
               <br />
               <span className="text-foreground">{me?.profile?.name || 'User'}</span>
            </div>
         </div>

         {/* Main content */}
         <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
               {/* Title and description - centered */}
               <div className="mb-8 text-center">
                  <h1 className="text-2xl font-semibold mb-2">Create a new workspace</h1>
                  <p className="text-muted-foreground text-sm">
                     Workspaces are shared environments where teams can work on issues.
                  </p>
               </div>

               {/* Form with background */}
               <div className="bg-card p-6 rounded-lg">
                  {error && (
                     <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-md text-destructive text-sm">
                        {error}
                     </div>
                  )}

                  <Form {...form}>
                     <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                           control={form.control}
                           name="workspaceName"
                           render={({ field }) => (
                              <FormItem>
                                 <FormLabel>Workspace Name</FormLabel>
                                 <FormControl>
                                    <Input placeholder="My Workspace" {...field} />
                                 </FormControl>
                                 <FormMessage />
                              </FormItem>
                           )}
                        />

                        <FormField
                           control={form.control}
                           name="workspaceUrl"
                           render={({ field }) => (
                              <FormItem>
                                 <FormLabel>Workspace URL</FormLabel>
                                 <div className="flex items-center">
                                    <div className="text-muted-foreground mr-1">
                                       {typeof window !== 'undefined'
                                          ? window.location.host
                                          : 'example.com'}
                                       /
                                    </div>
                                    <FormControl>
                                       <Input placeholder="my-workspace" {...field} />
                                    </FormControl>
                                 </div>
                                 <FormMessage />
                              </FormItem>
                           )}
                        />

                        <Button
                           type="submit"
                           className="w-full bg-[#5E6AD2] hover:bg-[#4954b9] text-white"
                           disabled={isSubmitting}
                        >
                           {isSubmitting ? 'Creating workspace...' : 'Create workspace'}
                        </Button>
                     </form>
                  </Form>
               </div>
            </div>
         </div>
      </div>
   );
}
