#!/bin/bash

echo "🚀 Pushing fixes to GitHub..."
echo "Repository: https://github.com/chachapranu/first-principles-web.git"
echo ""
echo "This will push the following fixes:"
echo "✅ Resolved merge conflict in next.config.ts"
echo "✅ Fixed react-markdown TypeScript compatibility"
echo "✅ Updated Netlify configuration"
echo ""

# Try to push
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Successfully pushed to GitHub!"
    echo "Netlify will now automatically rebuild your site."
    echo ""
    echo "Check your Netlify dashboard for the new build status."
else
    echo ""
    echo "❌ Push failed. You may need to:"
    echo "1. Set up GitHub authentication (personal access token)"
    echo "2. Or push manually through GitHub web interface"
    echo ""
    echo "Files ready to push:"
    echo "- next.config.ts (merge conflict resolved)"
    echo "- src/app/tutorial/[id]/page.tsx (TypeScript fixes)"
    echo "- src/app/tutorial/[id]/chapter/[chapterNumber]/page.tsx (TypeScript fixes)"
    echo "- netlify.toml (simplified config)"
fi